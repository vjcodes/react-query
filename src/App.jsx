import { useState } from "react";
import PostsList from "./components/PostsList";

function App() {
  const [toggle, setToggle] = useState(true);
  return (
    <>
      <div> Hey I am vinayak </div>
      <button onClick={() => setToggle(!toggle)}>Toggle</button>
      {toggle && <PostsList />}
    </>
  );
}

export default App;
