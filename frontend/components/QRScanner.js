import { useState, useRef, useEffect } from 'react';
import { X, Camera } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);
    const [scanning, setScanning] = useState(false);
    const streamRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setScanning(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Unable to access camera. Please ensure camera permissions are granted.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const handleVideoPlay = () => {
        if (typeof window !== 'undefined' && window.BarcodeDetector) {
            scanQRCode();
        } else {
            // Fallback: Use manual capture button
            setError('QR scanning is best supported on mobile devices. Use the capture button to scan.');
        }
    };

    const scanQRCode = async () => {
        if (!scanning) return;

        try {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Try to use BarcodeDetector if available
                if (window.BarcodeDetector) {
                    const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    const barcodes = await barcodeDetector.detect(canvas);

                    if (barcodes.length > 0) {
                        onScan(barcodes[0].rawValue);
                        stopCamera();
                        return;
                    }
                }
            }
        } catch (err) {
            console.error('Scan error:', err);
        }

        // Continue scanning
        if (scanning) {
            requestAnimationFrame(scanQRCode);
        }
    };

    const handleManualCapture = () => {
        // Allow manual photo capture for manual inspection
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (canvas && video) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            alert('Frame captured. Please manually read the QR code and enter the ID in the text field.');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Scan QR Code</h3>
                    <button
                        onClick={() => {
                            stopCamera();
                            onClose();
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800">{error}</p>
                    </div>
                )}

                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onPlay={handleVideoPlay}
                        className="w-full h-auto"
                        style={{ maxHeight: '400px' }}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border-4 border-green-500 rounded-lg" style={{ width: '250px', height: '250px' }}>
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                        Position the QR code within the frame
                    </p>
                    <button
                        onClick={handleManualCapture}
                        className="btn-primary inline-flex items-center"
                    >
                        <Camera className="w-5 h-5 mr-2" />
                        Capture Frame
                    </button>
                </div>
            </div>
        </div>
    );
}
