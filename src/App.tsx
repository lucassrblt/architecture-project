import './App.css';
import { SetStateAction, useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setPrompt(e.target.value);
  };

  const handleGenerateImage = async () => {
    // APPEL DE L'API ICI POUR GÉNÉRER L'IMAGE
    const generatedImageUrl = await generateImageFromPrompt(prompt);
    setImageUrl(generatedImageUrl);
  };

  const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    // REMPLACER PAR L'APPEL DE L'API D'IMAGE
    return new Promise((resolve) => {
      setTimeout(() => {
        // Exemple d'URL d'image aléatoire
        resolve('https://via.placeholder.com/400');
      }, 1000);
    });
  };

  return (
    <>
      <div className='cta-container'> 
        <input 
          type="text" 
          value={prompt} 
          onChange={handleChange} 
          placeholder="Enter your prompt" 
        />
        <div>
          <button onClick={handleGenerateImage}>Generate Image</button>
        </div>
      </div>
      <div>
        {imageUrl ? (
          <img src={imageUrl} alt="Generated" />
        ) : (
          <div style={{ width: '400px', height: '400px', backgroundColor: 'black' }} />
        )}
      </div>
    </>
  );
}

export default App;
