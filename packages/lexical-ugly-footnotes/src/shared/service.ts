export type RefId = string;

export interface FootnoteRef {
  id: RefId;
  order: number;
}
export interface FootnoteBlock {
  id: RefId;
  order: number;
}

export class FootnoteService {
  // canonical state
  private refs = new Map<RefId, FootnoteRef>();
  private blocks = new Map<RefId, FootnoteBlock>();

  // doc-order cache (IDs only)
  private docOrderIds: RefId[] = [];
  private idToIndex = new Map<RefId, number>(); // 0-based index into docOrderIds

  /** ————— basics ————— */

  clear() {
    this.refs.clear();
    this.blocks.clear();
    this.docOrderIds = [];
    this.idToIndex.clear();
  }

  getReferencesSorted(): FootnoteRef[] {
    return Array.from(this.refs.values()).sort((a, b) => a.order - b.order);
  }
  getBlocksSorted(): FootnoteBlock[] {
    return Array.from(this.blocks.values()).sort((a, b) => a.order - b.order);
  }

  /** ————— doc-order index ————— */

  /** Replace the entire doc-order (IDs only) and mirror orders into refs/blocks */
  setDocOrder(ids: RefId[]) {
    this.docOrderIds = ids.slice();
    this.idToIndex.clear();
    ids.forEach((id, i) => this.idToIndex.set(id, i));

    // mirror 1-based order into refs/blocks
    ids.forEach((id, i) => {
      const order = i + 1;
      const r = this.refs.get(id);
      if (r) this.refs.set(id, { ...r, order });
      const b = this.blocks.get(id);
      if (b) this.blocks.set(id, { ...b, order });
    });
  }

  getDocOrderIds(): RefId[] {
    return this.docOrderIds;
  }
  indexOf(id: RefId): number | undefined {
    return this.idToIndex.get(id);
  }
  /** Next 1-based order immediately after prevId; if none, returns 1 */
  nextOrderAfter(prevId?: RefId | null): number {
    if (!prevId) return 1;
    const i = this.idToIndex.get(prevId);
    return i === undefined ? 1 : i + 2; // index 0 => order 1, "after" => +2
  }

  /** Insert a new id at a 1-based order, shifting others */
  insertIntoDocOrderAt(id: RefId, order: number) {
    const pos = Math.max(0, Math.min(order - 1, this.docOrderIds.length));
    this.docOrderIds.splice(pos, 0, id);
    this.setDocOrder(this.docOrderIds);
  }

  /** Remove an id from doc-order (and mirror) */
  removeFromDocOrder(id: RefId) {
    const i = this.idToIndex.get(id);
    if (i === undefined) return;
    this.docOrderIds.splice(i, 1);
    this.setDocOrder(this.docOrderIds);
  }

  /** ————— high-level mutations ————— */

  /** Upsert a reference; if order provided, shift others accordingly */
  upsertReference(id: RefId, order?: number): number {
    if (order === undefined) {
      // append at end in doc-order
      this.docOrderIds.push(id);
      this.setDocOrder(this.docOrderIds);
      this.refs.set(id, { id, order: this.docOrderIds.length });
      return this.docOrderIds.length;
    }
    // place at specific 1-based position
    this.insertIntoDocOrderAt(id, order);
    const idx = this.indexOf(id);
    if (idx === undefined) {
      throw new Error(
        `Failed to find index for id ${id} after inserting into doc order`,
      );
    }
    const final = idx + 1;
    this.refs.set(id, { id, order: final });
    return final;
  }

  /** Upsert a block; default to its reference's order */
  upsertBlock(id: RefId, order?: number): number {
    const ref = this.refs.get(id);
    const idx = this.indexOf(id);
    const final = order ?? ref?.order ?? (idx !== undefined ? idx + 1 : 1);
    this.blocks.set(id, { id, order: final });
    return final;
  }

  /** Remove both ref and block, shifting everything down */
  removeRefAndBlock(id: RefId) {
    this.refs.delete(id);
    this.blocks.delete(id);
    this.removeFromDocOrder(id); // re-numbers remaining items
  }

  /** Orphan-clean helpers, if you want them */
  getOrphanedRefs(): RefId[] {
    return Array.from(this.refs.values())
      .filter((r) => !this.blocks.has(r.id))
      .map((r) => r.id);
  }
  getOrphanedBlocks(): RefId[] {
    return Array.from(this.blocks.values())
      .filter((b) => !this.refs.has(b.id))
      .map((b) => b.id);
  }
  hasBlock(id: RefId): boolean {
    return this.blocks.has(id);
  }
  hasReference(id: RefId): boolean {
    return this.refs.has(id);
  }

  cleanup(): void {
    // Remove orphaned references
    const orphanedRefs = this.getOrphanedRefs();
    for (const id of orphanedRefs) {
      this.refs.delete(id);
      this.removeFromDocOrder(id);
    }

    // Remove orphaned blocks
    const orphanedBlocks = this.getOrphanedBlocks();
    for (const id of orphanedBlocks) {
      this.blocks.delete(id);
      this.removeFromDocOrder(id);
    }
  }
  /** Remove any ref/block entries whose ids are not in `allowedIds`.
      DOES NOT touch docOrderIds/idToIndex. */
  pruneToIds(allowedIds: Set<RefId>) {
    for (const id of Array.from(this.refs.keys())) {
      if (!allowedIds.has(id)) this.refs.delete(id);
    }
    for (const id of Array.from(this.blocks.keys())) {
      if (!allowedIds.has(id)) this.blocks.delete(id);
    }
  }

  debug() {
    return {
      refs: Array.from(this.refs.entries()),
      blocks: Array.from(this.blocks.entries()),
      docOrderIds: this.docOrderIds,
      idToIndex: Array.from(this.idToIndex.entries()),
    };
  }
}

export const footnoteService = new FootnoteService();
