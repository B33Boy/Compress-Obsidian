import Compressor from 'compressorjs';
import axios from 'axios';

// Example usage
export function compressImage(imageData: Uint8Array): Uint8Array {
    return imageData;
} 

export async function compressFile(file: File): Prom {

    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: 0.05,
        
            async success(result) {
                try{
                    const imgBuffer : ArrayBuffer = await result.arrayBuffer();
                    const imgArray = new Uint8Array(imgBuffer);    
                    resolve(imgArray);
                } catch (error) {
                    reject(error);
                }
            },
            error(err) {
              console.log(err.message);
              reject(err);
            },
          });
    });
}