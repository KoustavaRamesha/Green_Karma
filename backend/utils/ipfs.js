const axios = require('axios');
const FormData = require('form-data');

/**
 * Upload file to IPFS using Pinata
 */
async function uploadToIPFS(fileBuffer, fileName) {
    try {
        const formData = new FormData();
        formData.append('file', fileBuffer, fileName);

        const pinataApiKey = process.env.PINATA_API_KEY;
        const pinataSecretKey = process.env.PINATA_SECRET_KEY;

        if (!pinataApiKey || !pinataSecretKey) {
            console.warn('⚠️  Pinata credentials not configured. Skipping IPFS upload.');
            return {
                hash: 'no-ipfs-configured',
                url: ''
            };
        }

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretKey
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        const ipfsHash = response.data.IpfsHash;
        const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

        return {
            hash: ipfsHash,
            url: url
        };
    } catch (error) {
        console.error('IPFS upload error:', error.message);
        throw new Error('Failed to upload to IPFS');
    }
}

/**
 * Get file from IPFS
 */
async function getFromIPFS(ipfsHash) {
    try {
        const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
    } catch (error) {
        console.error('IPFS retrieval error:', error.message);
        throw new Error('Failed to retrieve from IPFS');
    }
}

module.exports = {
    uploadToIPFS,
    getFromIPFS
};
