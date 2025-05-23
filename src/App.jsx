import { useState } from "react";
import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
} from "@google/genai";

function App() {
    const [link, setLink] = useState("Upload an image to find a movie");
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);

    const fetchLink = async () => {
        if (!file && !description) return;

        setLink("Searching...");

        try {
            const ai = new GoogleGenAI({
                apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            });

            const prompt = `I will upload a single image from a movie and provide a brief user description to help identify the film. Your task is to analyze the image and the description together and return a list of the most likely full official English movie titles that match the scene.

User description:
"${description}"

Focus on the following visual and contextual clues:
– Character appearance (costumes, expressions, age)
– Actor recognition
– Scene composition and lighting
– Props, background, and setting
– Color grading and cinematographic style
– Genre or time period indicators
– Any relevant details from the user description above

Instructions:
– Always return a JSON array of up to 10 full official English movie titles, ranked from most likely to least likely.
– If you’re highly confident in one answer, place it at the top of the list.
– Do not include any explanations, release years, quotes, or formatting beyond the title list.
– Your response should only be a raw JSON array of strings.`;

            const image = await ai.files.upload({
                file,
            });

            const aiResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17",
                contents: [
                    createUserContent([
                        prompt,
                        createPartFromUri(image.uri, image.mimeType),
                    ]),
                ],
            });

            setLink(aiResponse.candidates[0].content.parts[0].text);
        } catch (error) {
            console.error(error);
            setLink("Error");
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <h3>{link}</h3>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    setFile(selectedFile);
                    setPreviewUrl(URL.createObjectURL(selectedFile));
                }}
            />
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Type movie description..." />
            <button onClick={fetchLink} disabled={!file && !description}>
                Submit
            </button>
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt="Uploaded Preview"
                    style={{ maxWidth: "300px", marginTop: "10px" }}
                />
            )}
        </div>
    );
}

export default App;
