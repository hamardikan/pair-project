const bcrypt = require('bcryptjs');

class Helper {
    // Untuk format date
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Untuk read time estimation
    static calculateReadTime(content) {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const readTime = Math.ceil(words / wordsPerMinute);
        return readTime + ' min read';
    }

    // Untuk capitalize
    static capitalize(str) {
        if (typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Untuk password comparison
    static comparePassword(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    }

    static createExcerpt(content, length = 150) {
        // First sanitize the HTML
        const sanitizedContent = this.sanitizeHtml(content);
        // Remove HTML tags for clean excerpt
        const plainText = sanitizedContent.replace(/<[^>]+>/g, '').trim();
        // Remove extra whitespace
        const cleanText = plainText.replace(/\s+/g, ' ');

        if (cleanText.length <= length) {
            return cleanText;
        }

        // Find the last complete word within the length limit
        const truncated = cleanText.substr(0, length);
        const lastSpace = truncated.lastIndexOf(' ');

        return truncated.substr(0, lastSpace) + '...';
    }

    // Enhanced sanitizeHtml method
    static sanitizeHtml(content) {
        if (!content) return '';

        return content
            // Remove script tags and their content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Remove onclick and other dangerous attributes
            .replace(/on\w+="[^"]*"/g, '')
            // Remove iframe tags
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            // Keep safe tags but remove potentially dangerous attributes
            .replace(/<(p|div|span|h[1-6]|ul|ol|li|a|img|blockquote|pre|code|br|hr)(.*?)>/gi, (match, tag, attributes) => {
                // Only allow specific safe attributes
                const safeAttributes = attributes
                    .replace(/on\w+="[^"]*"/g, '') // Remove event handlers
                    .replace(/style="[^"]*"/g, '')  // Remove inline styles
                    .replace(/javascript:[^"']*/g, ''); // Remove javascript: protocols

                // For img tags, ensure src is properly formatted
                if (tag === 'img') {
                    // Keep only src, alt, and class attributes
                    const src = attributes.match(/src="([^"]*)"/);
                    const alt = attributes.match(/alt="([^"]*)"/);
                    const className = attributes.match(/class="([^"]*)"/);

                    let newAttributes = '';
                    if (src) newAttributes += ` ${src[0]}`;
                    if (alt) newAttributes += ` ${alt[0]}`;
                    if (className) newAttributes += ` ${className[0]}`;

                    return `<${tag}${newAttributes}>`;
                }

                return `<${tag}${safeAttributes}>`;
            });
    }

    // Untuk format username dari email kalau username kosong
    static generateUsernameFromEmail(email) {
        return email.split('@')[0];
    }

    // Untuk format tags
    static formatTags(tags) {
        return tags.map(tag => tag.name).join(', ');
    }


    // Untuk generate avatar jika tidak ada
    static getDefaultAvatar(username) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
    }

    // Utility function to validate URLs
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

}

module.exports = Helper;