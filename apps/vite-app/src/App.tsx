import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import { MyComponent, useMyHook } from "lexical-ugly-footnotes"
import { Editor } from "@repo/ui"
import { } from "@repo/ui"
function App() {
  // const { count, increment } = useMyHook()

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {/* <MyComponent>
          <p>Count from hook: {count}</p>
          <button onClick={increment}>
            Increment
          </button>
        </MyComponent> */}
      </div>
      <div className="card" style={{ width: '100%', maxWidth: '800px', margin: '20px auto' }}>
        <h2>Lexical Editor</h2>
        <Editor />
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
