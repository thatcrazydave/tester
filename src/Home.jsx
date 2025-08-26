import './styles/home.css'
function Home () {
        const name = "Verya";
  return (
    <>
   <div className="header">
    <h1>Welcome to {name}</h1>
    <p>Your gateway to seamless solutions</p>
   </div>
    <div className='content'>
      <h2>Whats {name}</h2>
      <p>{name} is a cutting-edge platform designed to streamline your workflow and enhance productivity. With a user-friendly interface and powerful features, {name} empowers individuals and teams to achieve their goals efficiently.</p>
      <h2>Features</h2>
    </div>
    </>
  );
}
export default Home