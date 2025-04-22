import { useNavigate } from 'react-router-dom';

function NextPage() {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/');
  };
    return (
      <div>
        <h1>Next page</h1>
        <h2>info here, descriptions etc</h2>
        <button onClick={goHome}>Back to Home</button>
      </div>
       
       
    )
  }
  
  
  export default NextPage

  