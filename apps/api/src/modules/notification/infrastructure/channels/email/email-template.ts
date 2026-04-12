const BASE_STYLES = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
  .content { padding: 20px; background: #f9fafb; }
  .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
`;

interface EmailLayoutParams {
  title: string;
  headerContent: string;
  bodyContent: string;
  extraStyles?: string;
  footerContent?: string;
}

export function renderEmailLayout({
  title,
  headerContent,
  bodyContent,
  extraStyles = '',
  footerContent = '',
}: EmailLayoutParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        ${BASE_STYLES}
        ${extraStyles}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${headerContent}
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        <div class="footer">
          <p>DropIt - Plateforme de coaching d'Haltérophilie</p>
          ${footerContent}
        </div>
      </div>
    </body>
    </html>
  `;
}
