// 'use client'
import { Tabs } from '@base-ui-components/react/tabs';

export default function EditorPreview() {
    return (
      <Tabs.Root defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="projects">
            Projects
          </Tabs.Tab>
          <Tabs.Tab value="account">
            Account
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="overview">
          Overview
        </Tabs.Panel>
        <Tabs.Panel value="projects">
          Projects
        </Tabs.Panel>
        <Tabs.Panel value="account">
          Account
        </Tabs.Panel>
      </Tabs.Root>
    );
  }