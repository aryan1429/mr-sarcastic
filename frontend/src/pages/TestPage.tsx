const TestPage = () => {
  console.log("TestPage is rendering!");
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      color: 'black', 
      padding: '20px',
      minHeight: '100vh',
      fontSize: '18px'
    }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>TEST PAGE - If you can see this, React is working!</h1>
      <p>This is a simple test without any complex components or CSS.</p>
      <div style={{ 
        backgroundColor: 'lightblue', 
        padding: '15px', 
        margin: '20px 0',
        border: '2px solid blue'
      }}>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default TestPage;
