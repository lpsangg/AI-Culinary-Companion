
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Tên của món ăn, ví dụ: 'Gà xào sả ớt'" },
    description: { type: Type.STRING, description: "Một đoạn mô tả ngắn, hấp dẫn về món ăn." },
    servings: { type: Type.NUMBER, description: "Số lượng khẩu phần ăn, ví dụ: 4" },
    prepTime: { type: Type.NUMBER, description: "Thời gian chuẩn bị (sơ chế), tính bằng phút." },
    cookTime: { type: Type.NUMBER, description: "Thời gian nấu trên bếp, tính bằng phút." },
    region: { type: Type.STRING, description: "Vùng miền của món ăn (ví dụ: 'Miền Bắc', 'Miền Nam', 'Ý',...)" },
    mainIngredient: { type: Type.STRING, description: "Nguyên liệu chính (ví dụ: 'Gà', 'Thịt bò', 'Hải sản',...)" },
    method: { type: Type.STRING, description: "Phương pháp chế biến chính (ví dụ: 'Xào', 'Nướng', 'Hấp',...)" },
    taste: { type: Type.STRING, description: "Hương vị đặc trưng (ví dụ: 'Chua cay', 'Ngọt', 'Mặn',...)" },
    occasion: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các dịp lễ hoặc tình huống phù hợp (ví dụ: 'Bữa tối', 'Tiệc gia đình')" },
    spiceLevel: { type: Type.STRING, description: "Mức độ cay (ví dụ: 'Không cay', 'Cay nhẹ', 'Cay nồng')" },
    dietStyle: { type: Type.STRING, description: "Phong cách ăn (ví dụ: 'Thông thường', 'Ít dầu mỡ / Healthy', 'Ăn chay')" },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tên nguyên liệu" },
          quantity: { type: Type.STRING, description: "Số lượng và đơn vị" },
        },
        required: ["name", "quantity"],
      },
      description: "Danh sách các nguyên liệu cần thiết."
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Mô tả chi tiết của một bước nấu ăn." }
        },
        required: ["description"],
      },
      description: "Các bước thực hiện món ăn theo thứ tự."
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Các mẹo nhỏ hoặc lưu ý để món ăn ngon hơn."
    },
  },
  required: ["name", "description", "servings", "prepTime", "cookTime", "ingredients", "steps"]
};


export const generateRecipeFromPrompt = async (prompt: string): Promise<Recipe> => {
  const fullPrompt = `
### BỐI CẢNH (CONTEXT)
Bạn là "Bếp Trưởng AI", một chuyên gia ẩm thực ảo, sáng tạo, am hiểu văn hóa ẩm thực toàn cầu và đặc biệt là ẩm thực Việt Nam. Nhiệm vụ chính của bạn là hỗ trợ người dùng bằng cách tạo ra các công thức nấu ăn.

### QUY TẮC AN TOÀN (SAFETY RULE)
**QUAN TRỌNG:** Bạn phải từ chối mọi yêu cầu không liên quan đến nấu ăn, công thức, thực phẩm, hoặc ẩm thực. Nếu yêu cầu của người dùng không liên quan (ví dụ: "đếm từ 1 đến 100", "thủ đô của Pháp là gì?", "viết một bài thơ về mùa xuân"...), bạn phải trả về một đối tượng JSON tuân thủ schema với các giá trị sau:
- "name": "Yêu cầu không hợp lệ"
- "description": "Là một Bếp Trưởng AI, tôi chỉ có thể hỗ trợ các yêu cầu liên quan đến ẩm thực. Vui lòng thử lại với một yêu cầu về món ăn hoặc công thức bạn nhé!"
- Các trường số (servings, prepTime, cookTime) đặt là 0.
- Các trường mảng (ingredients, steps, tips, occasion) để là mảng rỗng [].
- Các trường chuỗi còn lại (region, mainIngredient, method, taste, spiceLevel, dietStyle) có thể đặt là "Không áp dụng".

### NHIỆM VỤ (TASK)
Nếu yêu cầu của người dùng hợp lệ (liên quan đến ẩm thực), hãy sáng tạo một công thức nấu ăn hoàn chỉnh dựa trên yêu cầu đó.

### YÊU CẦU ĐẦU RA (OUTPUT REQUIREMENT)
- **Định dạng:** Bắt buộc phải trả về một đối tượng JSON duy nhất, không có bất kỳ văn bản nào khác trước hoặc sau nó.
- **Cấu trúc:** Đối tượng JSON phải tuân thủ nghiêm ngặt theo schema đã được cung cấp.
- **Chất lượng nội dung (cho yêu cầu hợp lệ):**
  - Công thức phải thực tế, dễ làm, với nguyên liệu dễ tìm.
  - Hướng dẫn các bước phải chi tiết, rõ ràng, phù hợp cho người mới bắt đầu.
  - Phần "mẹo" phải thực sự hữu ích và có giá trị.
  - Phải điền đầy đủ các trường: spiceLevel (Không cay/Cay nhẹ/Cay nồng) và dietStyle (Thông thường/Ít dầu mỡ / Healthy/Ăn chay).
- **Ngôn ngữ:** Toàn bộ nội dung trong JSON phải bằng tiếng Việt.

### YÊU CẦU CỦA NGƯỜI DÙNG (USER REQUEST)
"${prompt}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });
    
    const recipeJsonText = response.text.trim();
    const generatedRecipe = JSON.parse(recipeJsonText) as Omit<Recipe, 'id' | 'image'>;

    // Add a unique ID and default image to the recipe
    const recipeWithId: Recipe = {
      ...generatedRecipe,
      id: Date.now(),
      image: "/bg/photo.jpg", // Ảnh mặc định cho công thức AI
    };
    
    return recipeWithId;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Không thể tạo công thức từ AI. Vui lòng kiểm tra lại yêu cầu của bạn.");
  }
};

// FIX: Add getAiRecipeSuggestion function to be used in AiChat.tsx
export const getAiRecipeSuggestion = async (prompt: string, recipes: Recipe[]): Promise<string> => {
  const recipeNames = recipes.map(r => r.name).join(', ');

  const fullPrompt = `
### BỐI CẢNH (CONTEXT)
Bạn là "Trợ lý Bếp AI", một chuyên gia ẩm thực ảo, thân thiện. Nhiệm vụ của bạn là trò chuyện với người dùng để gợi ý món ăn.

### QUY TẮC (RULES)
1.  **Tập trung vào ẩm thực:** Chỉ trả lời các câu hỏi về nấu ăn. Lịch sự từ chối các chủ đề khác.
2.  **Thân thiện và ngắn gọn:** Giữ câu trả lời ngắn gọn, tự nhiên như đang trò chuyện.
3.  **Gợi ý cụ thể:** Dựa vào yêu cầu của người dùng, gợi ý một món ăn. Mô tả ngắn gọn tại sao nó phù hợp.
4.  **Tham khảo danh sách:** Đây là các món đã có: ${recipeNames}. Bạn có thể gợi ý một món trong danh sách này nếu nó khớp hoàn toàn với yêu cầu, nếu không, hãy sáng tạo một ý tưởng mới.
5.  **Không tạo công thức đầy đủ:** Đừng viết ra công thức chi tiết. Chỉ gợi ý tên món và lý do.

### YÊU CẦU CỦA NGƯỜI DÙNG (USER REQUEST)
"${prompt}"

### NHIỆM VỤ (TASK)
Hãy đưa ra một câu trả lời ngắn gọn và hữu ích.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    
    return response.text.trim();

  } catch (error) {
    console.error("Gemini API call for suggestion failed:", error);
    throw new Error("Không thể lấy gợi ý từ AI. Vui lòng thử lại.");
  }
};
