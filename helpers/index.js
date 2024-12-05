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

    // Untuk excerpt dari content
    static createExcerpt(content, length = 150) {
        // Remove HTML tags untuk excerpt yang bersih
        const plainText = content.replace(/<[^>]+>/g, '');
        if (plainText.length <= length) return plainText;
        return plainText.substring(0, length) + '...';
    }

    // Untuk format username dari email kalau username kosong
    static generateUsernameFromEmail(email) {
        return email.split('@')[0];
    }

    // Untuk format tags
    static formatTags(tags) {
        return tags.map(tag => tag.name).join(', ');
    }

    // Untuk sanitasi HTML (basic)
    static sanitizeHtml(content) {
        // Basic sanitization, bisa diganti dengan library seperti DOMPurify jika diperlukan
        return content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '');
    }

    // Untuk generate avatar jika tidak ada
    static getDefaultAvatar(username) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;
    }
}

module.exports = Helper;