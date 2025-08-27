import './styles/home.css'
function Home () {
        const name = "Verya";
  return (
    <>
   <div className="header">
    <h1>Welcome to {name}</h1>
    <p>AI-powered learning and content aggregation platform</p>
   </div>
    <div className='content'>
      <h2>What's {name}</h2>
      <p>To create a personalized, AI-driven knowledge hub that helps users learn, explore, and interact with information efficiently. Vayrex combines interactive learning modules, content discovery, and AI assistant tools in one sleek platform</p>
      <h2>Features</h2>
    </div>
    </>
  );
}
export default Home