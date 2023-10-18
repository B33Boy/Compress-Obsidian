import Compressor from 'compressorjs';

// Example usage
export async function compressFile(file: File, ratio: number): Promise<Uint8Array> {

    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: ratio,
        
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