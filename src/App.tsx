import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: { target: { value: string; }; }) => {
    setPrompt(e.target.value);
  };

  const generateImage = async () => {
    if (prompt) {
      setLoading(true);
      try {
        const generatedImageUrl = await generateImageFromPrompt(prompt);
        setImageUrl(generatedImageUrl);
      } catch (error) {
        console.error("Erreur lors de la génération de l'image :", error);
        setImageUrl('');
      } finally {
        setLoading(false);
      }
    } else {
      setImageUrl('');
    }
  };
  const [images, setImages] = useState<string[]>([]);
  const getImages = async (): Promise<string> => {
    // console.log('getImages');
    const response = await fetch(`http://localhost:3001/images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur de réseau lors de la génération de l\'image');
    }
    const imageListe = await response.json();
    // console.log(imageListe);
    const imagesUrl = imageListe.message?.map((image: { url: string; }) => image.url);
    // console.log(imagesUrl, 'imagesUrl');
    setImages(imagesUrl);
    return imagesUrl[0];

  };
  const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    console.log('prompt', prompt);
    const response = await fetch(`http://localhost:3001`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
    });

    if (!response.ok) {
        throw new Error('Erreur de réseau lors de la génération de l\'image');
    }

    const data = await response.text();
    // console.log(data);
    setImageUrl(data);
    return data;
};

useEffect(() => {

  getImages();

}
, []);

  return (
    <>
      <div className='cta-container'> 
        <input 
          type="text" 
          value={prompt} 
          onChange={handleChange} 
          placeholder="Enter your prompt" 
        />
      </div>
      <button onClick={generateImage}>Generate</button>
      <div className='flex-container'>
        {loading ? (
          <div className='loading-text'>Chargement de l'image...</div>
        ) : imageUrl ? (
          <img className='generated-img' src={imageUrl} alt="Generated" />
        ) : (
          <div style={{ width: '400px', height: '400px', backgroundColor: 'black' }} />
        )}
      </div>
      {
        images.length > 0 && (
          <div>
            <h2>Images générées</h2>
            <div className='images-container'>
              {images.map((img, index) => (
                <img key={index} src={img} alt={`Generated ${index}`} />
              ))}
            </div>
          </div>
        )
      }
    </>
  );
}

export default App;