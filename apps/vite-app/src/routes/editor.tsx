import { createFileRoute } from '@tanstack/react-router'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import { MyComponent, useMyHook } from "lexical-ugly-footnotes"
import { Editor,  } from "@repo/ui"
import { api } from '../lib/api-server'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/editor')({
  component: RouteComponent,
})

function RouteComponent() {
    const [initialContent, setInitialContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
    // Load initial content on mount
    useEffect(() => {
      const loadContent = async () => {
        try {
          const content = await api.getContent('json');
          setInitialContent(content);
        } catch (error) {
          console.error('Failed to load content:', error);
          // Continue with empty editor if load fails
          setInitialContent(null);
        } finally {
          setLoading(false);
        }
      };
  
      loadContent();
    }, []);
  
    // Save handler
    // const handleSubmit = async (editor: LexicalEditor) => {
    //   setSaveStatus('saving');
    //   try {
    //     const editorState = editor.getEditorState();
    //     const json = JSON.stringify(editorState);
        
    //     await api.saveContent(json, 'json');
    //     setSaveStatus('saved');
        
    //     // Reset status after 2 seconds
    //     setTimeout(() => setSaveStatus('idle'), 2000);
    //   } catch (error) {
    //     console.error('Failed to save content:', error);
    //     setSaveStatus('error');
    //   }
    // };
  
    if (loading) {
      return <div>Loading editor...</div>;
    }
    return (
      <>
        <h1>Vite + React</h1>
  
        {saveStatus !== 'idle' && (
            <div style={{ marginBottom: '10px', fontSize: '14px' }}>
              {saveStatus === 'saving' && '💾 Saving...'}
              {saveStatus === 'saved' && '✅ Saved!'}
              {saveStatus === 'error' && '❌ Save failed'}
            </div>
          )}
  
        <div className="card" style={{ width: '100%', maxWidth: '800px', margin: '20px auto' }}>
          <h2>Lexical Editor</h2>
          <Editor content={initialContent} submitHandler={() => {}} />
            {/* < */}
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </>
    )
}
