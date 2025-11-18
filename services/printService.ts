import type { Recipe } from '../types';

/**
 * Service to handle recipe printing and PDF export
 */
export class PrintService {
  /**
   * Print recipe using browser's print functionality
   */
  static printRecipe(recipe: Recipe): void {
    // Create a new window with the recipe content
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Vui lòng cho phép popup để in công thức');
      return;
    }

    // Generate HTML content for printing
    const htmlContent = this.generatePrintHTML(recipe);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      
      // Close window after printing (optional)
      // printWindow.onafterprint = () => printWindow.close();
    };
  }

  /**
   * Generate HTML content for printing
   */
  private static generatePrintHTML(recipe: Recipe): string {
    // Helper function to extract text from ingredient/step objects
    const getIngredientText = (item: any): string => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        // For IngredientItem: { name, quantity }
        if (item.name && item.quantity) {
          return `${item.name}: ${item.quantity}`;
        }
        return item.name || item.text || item.description || JSON.stringify(item);
      }
      return String(item);
    };

    const getStepText = (item: any): string => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        // For RecipeStep: { description, image? }
        return item.description || item.text || JSON.stringify(item);
      }
      return String(item);
    };

    const getTipsText = (): string => {
      if (!recipe.tips) return '';
      if (typeof recipe.tips === 'string') return recipe.tips;
      if (Array.isArray(recipe.tips)) return recipe.tips.join(' ');
      return String(recipe.tips);
    };

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${recipe.name} - Công thức nấu ăn</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #f97316;
            padding-bottom: 20px;
          }
          
          h1 {
            font-size: 32px;
            color: #f97316;
            margin-bottom: 10px;
          }
          
          .description {
            font-size: 16px;
            color: #666;
            margin-bottom: 15px;
          }
          
          .meta-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin: 15px 0;
          }
          
          .meta-item {
            padding: 8px 15px;
            background: #fff7ed;
            border-radius: 8px;
            font-size: 14px;
          }
          
          .meta-label {
            font-weight: 600;
            color: #f97316;
          }
          
          .tags {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 15px;
          }
          
          .tag {
            background: #fed7aa;
            color: #7c2d12;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
          }
          
          .section {
            margin: 30px 0;
            page-break-inside: avoid;
          }
          
          h2 {
            font-size: 24px;
            color: #f97316;
            margin-bottom: 15px;
            border-left: 4px solid #f97316;
            padding-left: 15px;
          }
          
          .ingredients {
            background: #fffbeb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #fed7aa;
          }
          
          .ingredients ul {
            list-style: none;
            padding: 0;
          }
          
          .ingredients li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
            border-bottom: 1px solid #fed7aa;
          }
          
          .ingredients li:last-child {
            border-bottom: none;
          }
          
          .ingredients li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #f97316;
            font-weight: bold;
          }
          
          .steps {
            counter-reset: step-counter;
          }
          
          .step {
            counter-increment: step-counter;
            padding: 15px;
            margin-bottom: 15px;
            background: #f3f4f6;
            border-radius: 8px;
            position: relative;
            padding-left: 60px;
          }
          
          .step:before {
            content: counter(step-counter);
            position: absolute;
            left: 15px;
            top: 15px;
            background: #f97316;
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            line-height: 35px;
            text-align: center;
          }
          
          .tips {
            background: #ecfdf5;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            margin-top: 20px;
          }
          
          .tips strong {
            color: #059669;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
          
          @media print {
            body {
              padding: 10px;
            }
            
            .header {
              page-break-after: avoid;
            }
            
            .section {
              page-break-inside: avoid;
            }
            
            @page {
              margin: 1.5cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${recipe.name}</h1>
          <p class="description">${recipe.description}</p>
          
          <div class="meta-info">
            <div class="meta-item">
              <span class="meta-label">Khẩu phần:</span> ${recipe.servings} người
            </div>
            <div class="meta-item">
              <span class="meta-label">Chuẩn bị:</span> ${recipe.prepTime} phút
            </div>
            <div class="meta-item">
              <span class="meta-label">Nấu:</span> ${recipe.cookTime} phút
            </div>
            <div class="meta-item">
              <span class="meta-label">Tổng:</span> ${recipe.prepTime + recipe.cookTime} phút
            </div>
          </div>
          
          <div class="tags">
            <span class="tag">${recipe.region}</span>
            <span class="tag">${recipe.mainIngredient}</span>
            <span class="tag">${recipe.method}</span>
          </div>
        </div>
        
        <div class="section ingredients">
          <h2>Nguyên liệu</h2>
          <ul>
            ${recipe.ingredients.map(ing => `<li>${getIngredientText(ing)}</li>`).join('')}
          </ul>
        </div>
        
        <div class="section">
          <h2>Cách làm</h2>
          <div class="steps">
            ${recipe.steps.map(step => `<div class="step">${getStepText(step)}</div>`).join('')}
          </div>
        </div>
        
        ${getTipsText() ? `
          <div class="section">
            <div class="tips">
              <strong>Mẹo hay:</strong> ${getTipsText()}
            </div>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Công thức từ Nấu ăn mỗi ngày</p>
          <p>In vào: ${new Date().toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Export recipe as PDF (using browser's print to PDF)
   */
  static exportToPDF(recipe: Recipe): void {
    // Same as print, but user can choose "Save as PDF" in print dialog
    this.printRecipe(recipe);
    
    // Show instruction to user
    setTimeout(() => {
      console.log('💡 Tip: In hộp thoại in, chọn "Save as PDF" để xuất file PDF');
    }, 100);
  }
}
