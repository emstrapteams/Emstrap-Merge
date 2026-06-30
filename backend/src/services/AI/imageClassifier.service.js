import axios from "axios";
import { AI_SERVICE_URL } from "../../config/ai.js";

export const classifyImage = async (imageUrl) => {
    const response = await axios.post(
        `${AI_SERVICE_URL}/classify`,
        {
            imageUrl,
        }
    );

    return response.data;
};