import express from "express";
import Replicate from "replicate";
import bodyParser from "body-parser";
import { request } from "express";
import fs from "fs";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import downloadImage from "./function/downloadImage.js";
dotenv.config();
AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: "https://www.npmjs.com/package/create-replicate",
});

const app = express();
const port = process.env.PORT || 3001;
const s3 = new AWS.S3();
const bucketName = "replicateimage";

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { prompt } = req.body;
  try {
    const output = await replicate.run(
      "lucataco/flux-dev-lora:613a21a57e8545532d2f4016a7c3cfa3c7c63fded03001c2e69183d557a929db",
      {
        input: {
          prompt: prompt,
          hf_lora: "alvdansen/frosting_lane_flux",
          lora_scale: 0.8,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          guidance_scale: 3.5,
          output_quality: 80,
          prompt_strength: 0.8,
          num_inference_steps: 28,
        },
      }
    );

    if (output.error) {
      res.send(output.error);
      return;
    }
    console.log(output, "output");
    const imageName = uuidv4();
    const imageUrl = output[0];
    const imagePath = await downloadImage(imageUrl, "output.webp");
    const image = fs.createReadStream(imagePath);
    const params = {
      Bucket: bucketName,
      Key: `${imageName}.webp`,
      Body: image,
      ContentType: "image/webp",
    };
    const data = await s3.upload(params).promise();
    const url = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: `${imageName}.webp`,
      Expires: 60 * 60 * 24,
    });
    console.log(url);
    res.send(url);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get("/images", async (req, res) => {
  try {
    const params = { Bucket: bucketName };
    const data = await s3.listObjectsV2(params).promise(); //Récupère la iste des objets stockés dans le bucket

    // Renvoi d'une erreur si la liste du bucket récupérée est vide
    if (data.Contents.lenght === 0) {
      res.status(404).send({ success: false, message: "Aucune image" });
      // return

      // Logique lorsque la liste n'est pas vide
    } else {
      const images = data.Contents.map((item) => {
        // Map sur le contenu de la liste
        const imageUrl = s3.getSignedUrl("getObject", {
          // Attribution d'une url signée à chaque image
          Bucket: bucketName,
          Key: item.Key,
          Expires: 60 * 60 * 24, // url valide pendant 24h
        });
        return {
          key: item.Key,
          url: imageUrl,
        };
      });
      // Renvoi des url des images
      res.status(200).send({ success: true, message: images });
    }
  } catch (error) {
    console.log("Erreur : ", error);
    res
      .status(500)
      .send({
        success: false,
        message: "Erreur lors de la récupération d'images",
      });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
