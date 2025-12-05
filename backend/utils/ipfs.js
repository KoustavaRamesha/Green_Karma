const axios = require("axios");
const FormData = require("form-data");

/**
 * Upload file to IPFS using Pinata, or fallback to base64 data URL
 */
async function uploadToIPFS(fileBuffer, fileName, mimeType = "image/jpeg") {
  try {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      console.warn(
        "⚠️  Pinata credentials not configured. Using base64 fallback."
      );
      // Fallback to base64 data URL for local development
      const base64 = fileBuffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;
      return {
        hash: "local-base64",
        url: dataUrl,
      };
    }

    const formData = new FormData();
    formData.append("file", fileBuffer, fileName);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretKey,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    return {
      hash: ipfsHash,
      url: url,
    };
  } catch (error) {
    console.error("IPFS upload error:", error.message);
    // Fallback to base64 on error
    console.warn("Falling back to base64 data URL due to IPFS error");
    const base64 = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;
    return {
      hash: "fallback-base64",
      url: dataUrl,
    };
  }
}

/**
 * Get file from IPFS
 */
async function getFromIPFS(ipfsHash) {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return response.data;
  } catch (error) {
    console.error("IPFS retrieval error:", error.message);
    throw new Error("Failed to retrieve from IPFS");
  }
}

module.exports = {
  uploadToIPFS,
  getFromIPFS,
};
