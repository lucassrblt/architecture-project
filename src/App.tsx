import './App.css';
import { useEffect, useState } from 'react';
import loadingsvg from './loading.json';
import Lottie from "lottie-react";

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
  //creer un timer pour le loading

  const getImages = async (): Promise<string> => {
    // console.log('getImages');
    const response = await fetch(`http://52.47.184.9/images`, {
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
    const response = await fetch(`http://52.47.184.9`, {
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
useEffect(() => {
  //scroll to the top
  window.scrollTo(0, 0);
}
, [imageUrl]);

const [seeBigImage, setSeeBigImage] = useState(false);
const [bigImageURL, setBigImageURL] = useState('');

  return (
    <>
      <h1>Hetic AI</h1>
      <div className='cta-container'> 
        <input 
          type="text" 
          value={prompt} 
          onChange={handleChange} 
          placeholder="Enter your prompt" 
        />
      </div>
      <button className="btn" onClick={loading ? undefined : generateImage}>
    <svg height="24" width="24" fill="#FFFFFF" viewBox="0 0 24 24" data-name="Layer 1" id="Layer_1" className="sparkle">
        <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
    </svg>

    <span className="text">Generate</span>
</button>
      <div className='flex-container'>
        {loading ? (
          <Lottie animationData={loadingsvg} style={{ width: 200, height: 200 }} />
        ) : imageUrl ? (
          <div className='generated-container'>
            <h2>Generated image</h2>
          <img className='generated-img' src={imageUrl} alt="Generated" onClick={() => {
            setBigImageURL(imageUrl);
            setSeeBigImage(true);
          }}
          />
          </div>
        ) : (
         <></>
        )}
      </div>
      {
        images.length > 0 && (
          <div>
            <h2>Last generated images</h2>
            <div className='images-container'>
              {images.map((img, index) => (
                <img key={index} src={img} alt={`Generated ${index}`} onClick={() => {
                  setBigImageURL(img);
                  setSeeBigImage(true);
                }} />
              ))}
            </div>
          </div>
        )
      }

      {
        bigImageURL && seeBigImage && (
          <div className='big-image-container'>
            <img src={bigImageURL}
              alt="Generated"
              onClick={() => setSeeBigImage(false)}
            />
            <div className='close' onClick={() => setSeeBigImage(false)}>Close</div>
          </div>
        )

      }
    </>
  );
}

export default App;