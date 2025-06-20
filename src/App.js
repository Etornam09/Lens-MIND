import React, { useState } from 'react'; // Removed unused 'useEffect' import

const App = () => {
    const [initialPrompt, setInitialPrompt] = useState('');
    const [modificationPrompt, setModificationPrompt] = useState('');
    const [currentPromptForDraft, setCurrentPromptForDraft] = useState('');
    const [draftImage, setDraftImage] = useState(null);
    const [optimizedPrompt, setOptimizedPrompt] = useState('');
    const [appState, setAppState] = useState('input'); // 'input', 'loading', 'draft_display', 'feedback', 'modify_draft_input', 'optimized_prompt_display'
    const [isLoading, setIsLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Placeholder for API key, Canvas will inject it at runtime.
    // For Netlify deployment, ensure you set REACT_APP_GEMINI_API_KEY in Netlify build environment variables.
    // The build process for Create React App will then correctly substitute process.env.REACT_APP_GEMINI_API_KEY.
    const apiKey = ""; // Reverted API key access for direct Canvas execution.

    const generateDraftImage = async (prompt) => {
        setIsLoading(true);
        setDraftImage(null); // Clear previous image
        setOptimizedPrompt(''); // Clear previous prompt
        setCurrentPromptForDraft(prompt); // Store the prompt used for this draft
        try {
            const payload = { instances: { prompt: prompt }, parameters: { "sampleCount": 1 } };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Image generation API error:", errorData);
                // Robustified error message with optional chaining and fallback
                throw new Error(`Image generation failed: ${errorData.error?.message || response.statusText || 'Unknown error'}`);
            }

            const result = await response.json();

            if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                setDraftImage(imageUrl);
                setAppState('draft_display');
            } else {
                setModalMessage("Could not generate a draft image. Please try again.");
                setShowModal(true);
                setAppState('input');
            }
        } catch (error) {
            console.error("Error generating draft image:", error);
            // Robustified modal message with optional chaining and fallback
            setModalMessage(`Failed to generate image: ${error?.message || 'Unknown error'}. Please try again.`);
            setShowModal(true);
            setAppState('input');
        } finally {
            setIsLoading(false);
        }
    };

    const generateOptimizedPrompt = async (base64ImageData) => {
        setIsLoading(true);
        setOptimizedPrompt(''); // Clear previous prompt
        try {
            const promptText = `Based on the most recent user request: '${currentPromptForDraft}' and the visual style of this image, generate a highly detailed, professional photography AI prompt. The prompt should be optimized for a realistic, cinematic, and high-quality output using Gemini AI.

            Include specific camera settings (e.g., white balance, aperture, shutter speed, ISO, focal length, depth of field, lens type like '85mm f/1.4 prime lens'), lighting conditions (e.g., golden hour, soft box lighting, natural light, dramatic rim lighting), photographic composition (e.g., rule of thirds, leading lines, low angle shot, wide-angle, close-up, medium shot, subject distance, pose, expression, dynamic action, serene stillness, scene elements, background blur/bokeh, symmetrical composition), and the intended mood/purpose of the image (e.g., dramatic portrait, serene landscape, bustling street photography, product photography, candid moment).

            Also, consider aspects a professional photographer would think about: the subject's interaction with the environment, the story the image tells, and subtle details.

            Crucially, do not explicitly mention 'draft image', 'user's request', 'visual style', or 'modification' in the final prompt. Focus solely on describing the desired final outcome as if you are giving a direct instruction to an image generation AI. Keep the prompt concise but extremely descriptive. The prompt should start with the core subject/scene and then elaborate on all the photographic details.`;

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: promptText },
                            {
                                inlineData: {
                                    mimeType: "image/png",
                                    data: base64ImageData.split(',')[1]
                                }
                            }
                        ]
                    }
                ],
            };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("LLM API error:", errorData);
                // Robustified error message with optional chaining and fallback
                throw new Error(`LLM generation failed: ${errorData.error?.message || response.statusText || 'Unknown error'}`);
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setOptimizedPrompt(text);
                setAppState('optimized_prompt_display');
            } else {
                setModalMessage("Could not generate an optimized prompt. Please try again.");
                setShowModal(true);
                setAppState('feedback');
            }
        } catch (error) {
            console.error("Error generating optimized prompt:", error);
            // Robustified modal message with optional chaining and fallback
            setModalMessage(`Failed to generate prompt: ${error?.message || 'Unknown error'}. Please try again.`);
            setShowModal(true);
            setAppState('feedback');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitialPromptSubmit = (e) => {
        e.preventDefault();
        if (initialPrompt.trim()) {
            generateDraftImage(initialPrompt);
            setAppState('loading');
        } else {
            setModalMessage("Please enter an initial prompt.");
            setShowModal(true);
        }
    };

    const handleModifyDraftSubmit = (e) => {
        e.preventDefault();
        if (modificationPrompt.trim()) {
            generateDraftImage(modificationPrompt);
            setAppState('loading');
            setModificationPrompt('');
        } else {
            setModalMessage("Please enter your modifications.");
            setShowModal(true);
        }
    };

    const handleFeedback = (liked) => {
        if (liked) {
            if (draftImage) {
                generateOptimizedPrompt(draftImage);
                setAppState('loading');
            } else {
                setModalMessage("No draft image found to optimize the prompt from.");
                setShowModal(true);
                setAppState('input');
            }
        } else {
            setAppState('modify_draft_input');
        }
    };

    const handleStartOver = () => {
        setInitialPrompt('');
        setModificationPrompt('');
        setCurrentPromptForDraft('');
        setDraftImage(null);
        setOptimizedPrompt('');
        setAppState('input');
        setShowModal(false);
        setModalMessage('');
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    const commonButtonClasses = "py-3 px-6 font-bold rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-75";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 text-gray-800 p-4 font-inter flex flex-col items-center justify-center">
            <style>{`
                body { font-family: 'Inter', sans-serif; }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: #F0F4F8;
                    padding: 2rem;
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 90%;
                    width: 400px;
                    color: #2D3748;
                }
                .logo-img {
                    background-color: transparent;
                }
            `}</style>

            <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl p-8 space-y-8">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="https://raw.githubusercontent.com/mdunb/test-image-hosting/main/Gemini_Generated_Image_w1fda4w1fda4w1fd.png"
                        alt="Lens MIND Logo"
                        className="h-24 w-24 object-contain mb-4 logo-img"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/transparent/transparent?text=LensMINDLogo'; }}
                    />
                    <h1 className="text-6xl font-extrabold text-blue-500 font-['Hancoke']">Lens MIND</h1>
                    <p className="text-xl text-gray-600 mt-2">AI Photography Prompt Generator</p>
                </div>

                {appState === 'input' && (
                    <form onSubmit={handleInitialPromptSubmit} className="space-y-6">
                        <label htmlFor="initial-prompt" className="block text-xl font-semibold text-gray-700">
                            What kind of image do you envision? (e.g., "A futuristic cityscape at sunset", "Portrait of a happy dog in a park")
                        </label>
                        <textarea
                            id="initial-prompt"
                            className="w-full p-4 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                            rows="4"
                            value={initialPrompt}
                            onChange={(e) => setInitialPrompt(e.target.value)}
                            placeholder="Describe your desired image..."
                        ></textarea>
                        <button
                            type="submit"
                            className={`${commonButtonClasses} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400`}
                        >
                            Generate Draft Image
                        </button>
                    </form>
                )}

                {isLoading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500"></div>
                        <p className="ml-4 text-xl text-indigo-600">Generating...</p>
                    </div>
                )}

                {appState === 'draft_display' && draftImage && (
                    <div className="space-y-6 text-center">
                        <h2 className="text-2xl font-semibold text-gray-700">Here's a draft image:</h2>
                        <div className="bg-gray-100 p-2 rounded-lg inline-block shadow-md">
                            <img src={draftImage} alt="Draft" className="max-w-full h-auto rounded-lg shadow-xl border border-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700">Does this resemble what you are looking for?</h3>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => handleFeedback(true)}
                                className={`${commonButtonClasses} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400`}
                            >
                                Yes, I like it!
                            </button>
                            <button
                                onClick={() => handleFeedback(false)}
                                className={`${commonButtonClasses} bg-blue-400 text-white hover:bg-blue-500 focus:ring-blue-300`}
                            >
                                No, I don't (Modify Draft)
                            </button>
                        </div>
                    </div>
                )}

                {appState === 'modify_draft_input' && (
                    <form onSubmit={handleModifyDraftSubmit} className="space-y-6">
                        <label htmlFor="modification-prompt" className="block text-xl font-semibold text-gray-700">
                            How would you like to modify the draft? (e.g., "Change the lighting to golden hour", "Make the subject smiling")
                        </label>
                        <textarea
                            id="modification-prompt"
                            className="w-full p-4 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                            rows="4"
                            value={modificationPrompt}
                            onChange={(e) => setModificationPrompt(e.target.value)}
                            placeholder="Describe your modifications..."
                        ></textarea>
                        <div className="flex justify-center space-x-4">
                            <button
                                type="submit"
                                className={`${commonButtonClasses} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400`}
                            >
                                Redesign with Modification
                            </button>
                            <button
                                type="button"
                                onClick={handleStartOver}
                                className={`${commonButtonClasses} bg-gray-400 text-white hover:bg-gray-500 focus:ring-gray-300`}
                            >
                                Start Over
                            </button>
                        </div>
                    </form>
                )}

                {appState === 'optimized_prompt_display' && optimizedPrompt && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-700 text-center">Here's your optimized AI prompt:</h2>
                        <div className="bg-gray-100 p-6 rounded-lg border border-indigo-500 shadow-lg break-words whitespace-pre-wrap">
                            <p className="text-lg text-gray-700">{optimizedPrompt}</p>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                            Copy this prompt and use it with your favorite AI image generation tool (like Gemini AI) for best results!
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={handleStartOver}
                                className={`${commonButtonClasses} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400`}
                            >
                                Start New Image
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <p className="text-lg mb-6">{modalMessage}</p>
                        <button
                            onClick={closeModal}
                            className={`${commonButtonClasses} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400`}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
