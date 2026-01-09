import {
  type HistoryState,
  createEmptyHistoryState,
} from "@lexical/react/LexicalHistoryPlugin";
import { type ReactNode, createContext, useContext, useMemo } from "react";

type SharedHistoryStateContext = {
  historyState: HistoryState;
};

const Context = createContext<SharedHistoryStateContext | null>(null);

interface SharedHistoryContextProps {
  children: ReactNode;
}

export const SharedHistoryContext = ({
  children,
}: SharedHistoryContextProps) => {
  const history = useMemo(
    () => ({ historyState: createEmptyHistoryState() }),
    [],
  );
  return <Context.Provider value={history}>{children}</Context.Provider>;
};

export const useSharedHistoryState = (): SharedHistoryStateContext => {
  const context = useContext(Context);
  if (!context) {
    throw new Error(
      "useSharedHistoryState must be used within a SharedHistoryContext provider",
    );
  }
  return context;
};
