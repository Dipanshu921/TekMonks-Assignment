export class TimeStoryScraper {
    constructor() {
        this.baseUrl = 'https://time.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        };
        
        // Sample data as fallback
        this.fallbackStories = [
            {
                "title": "Trump's Latest Foreign Policy Moves Draw International Scrutiny",
                "link": "https://time.com/latest-trump-foreign-policy/"
            },
            {
                "title": "Climate Change Impact on Global Agriculture Accelerating",
                "link": "https://time.com/climate-agriculture-impact/"
            },
            {
                "title": "Tech Industry Faces New Regulatory Challenges in 2025",
                "link": "https://time.com/tech-regulation-2025/"
            },
            {
                "title": "Healthcare Innovation Breakthrough Shows Promise",
                "link": "https://time.com/healthcare-innovation-breakthrough/"
            },
            {
                "title": "Economic Indicators Point to Shifting Global Markets",
                "link": "https://time.com/economic-indicators-global-markets/"
            },
            {
                "title": "Education Reform Initiatives Gain Momentum Nationwide",
                "link": "https://time.com/education-reform-initiatives/"
            }
        ];
    }
    async fetchPage(url) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: this.headers
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                let stream = res;
                if (res.headers['content-encoding'] === 'gzip') {
                    const zlib = require('zlib');
                    stream = res.pipe(zlib.createGunzip());
                } else if (res.headers['content-encoding'] === 'deflate') {
                    const zlib = require('zlib');
                    stream = res.pipe(zlib.createInflate());
                }
                
                stream.on('data', (chunk) => {
                    data += chunk;
                });
                
                stream.on('end', () => {
                    resolve(data);
                });
                
                stream.on('error', (error) => {
                    reject(error);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(15000, () => {
                req.abort();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }
    cleanText(text) {
        if (!text) return '';
        
        return text
            .replace(/<script[^>]*>.*?<\/script>/gi, '')  
            .replace(/<style[^>]*>.*?<\/style>/gi, '')  
            .replace(/<[^>]*>/g, '')  
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/')
            .replace(/&nbsp;/g, ' ')
            .replace(/&rsquo;/g, "'")
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&mdash;/g, '—')
            .replace(/&ndash;/g, '–')
            .replace(/\s+/g, ' ')
            .trim();
    }
    normalizeUrl(url) {
        if (!url) return '';
        url = url.trim();
        if (url.startsWith('//')) {
            return 'https:' + url;
        }
        if (url.startsWith('/')) {
            return this.baseUrl + url;
        }
        if (url.startsWith('http')) {
            return url;
        }
        return this.baseUrl + '/' + url;
    }

    async extractStories(html) {
        const stories = [];
        const seenTitles = new Set();
        const seenLinks = new Set();

        const jsonLdPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
        let jsonMatch;
        
        while ((jsonMatch = jsonLdPattern.exec(html)) !== null) {
            try {
                const jsonData = JSON.parse(jsonMatch[1]);
                if (jsonData['@type'] === 'Article' || jsonData.headline) {
                    const title = jsonData.headline || jsonData.name;
                    const link = jsonData.url || jsonData.mainEntityOfPage?.['@id'];
                    
                    if (title && link) {
                        const cleanTitle = this.cleanText(title);
                        const cleanLink = this.normalizeUrl(link);
                        
                        if (this.isValidStory(cleanLink, cleanTitle, seenTitles, seenLinks)) {
                            stories.push({ title: cleanTitle, link: cleanLink });
                            seenTitles.add(cleanTitle.toLowerCase());
                            seenLinks.add(cleanLink);
                        }
                    }
                }
            } catch (e) {/*ignore*/}
        }

        if (stories.length > 0) {
            return stories.slice(0, 6);
        }

        const patterns = [
            /data-title=["']([^"']{10,200})["'][^>]*href=["']([^"']*)"[^>]*>/gi,
            /href=["']([^"']*)"[^>]*data-title=["']([^"']{10,200})["'][^>]*>/gi,
            /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']{10,200})["'][^>]*>/gi,
            /<meta[^>]*content=["']([^"']{10,200})["'][^>]*property=["']og:title["'][^>]*>/gi,
            /<article[^>]*>.*?<a[^>]*href=["']([^"']*)"[^>]*>.*?<h[^>]*>([^<]{10,200})<\/h[^>]*>.*?<\/article>/gi,
            /<a[^>]*href=["']([^"']*)"[^>]*title=["']([^"']{10,200})["'][^>]*>/gi,
            /<a[^>]*href=["']([^"']*time\.com[^"']*)"[^>]*>([^<]{10,200})<\/a>/gi,
            /<nav[^>]*>.*?<a[^>]*href=["']([^"']*)"[^>]*>([^<]{10,200})<\/a>.*?<\/nav>/gi,
            /<div[^>]*class="[^"]*(?:story|article|post|news)[^"]*"[^>]*>.*?<a[^>]*href=["']([^"']*)"[^>]*>.*?([^<]{10,200}).*?<\/a>.*?<\/div>/gi
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                let link = match[1];
                let title = match[2];
                
                if (link && title) {
                    if (!link.includes('time.com') && title.includes('time.com')) {
                        [link, title] = [title, link];
                    }
                }
                if (!link || !title) continue;
                
                link = this.normalizeUrl(link);
                title = this.cleanText(title);
                
                if (this.isValidStory(link, title, seenTitles, seenLinks)) {
                    stories.push({ title, link });
                    seenTitles.add(title.toLowerCase());
                    seenLinks.add(link);
                    
                    if (stories.length >= 6) break;
                }
            }
            if (stories.length >= 6) break;
        }

        return stories.slice(0, 6);
    }

    isValidStory(link, title, seenTitles, seenLinks) {
        if (!title || title.length < 10 || title.length > 300) return false;
        if (seenTitles.has(title.toLowerCase()) || seenLinks.has(link)) return false;
        if (!link || !link.includes('time.com')) return false;
        
        const invalidPaths = [
            '/subscribe', '/newsletter', '/privacy', '/terms', '/contact',
            '/about', '/careers', '/masthead', '/customer-service',
            '/reprints', '/advertise', '/sitemap', '/rss', '/events',
            '/brand-licensing', '/help', '/support', '/login', '/register'
        ];
        
        if (invalidPaths.some(path => link.toLowerCase().includes(path))) return false;
        
        const titleLower = title.toLowerCase();
        const invalidKeywords = [
            'subscribe', 'newsletter', 'advertisement', 'promoted',
            'sponsored', 'shop', 'buy', 'purchase', 'sale',
            'discount', 'offer', 'deal', 'promo', 'sign up',
            'register', 'login', 'follow us'
        ];
        
        if (invalidKeywords.some(keyword => titleLower.includes(keyword))) return false;
        
        if (title.match(/^[A-Z\s]+$/)) return false;
        if (title.match(/^\d+$/)) return false;
        if (title.includes('...') && title.length < 25) return false;
        
        return true;
    }

    async getLatestStories() {
        try {
            console.log('Fetching Time.com homepage...');
            const html = await this.fetchPage(this.baseUrl);
            
            if (!html || html.length < 1000) {
                console.log('HTML content seems insufficient, using fallback...');
                return this.fallbackStories;
            }
            
            console.log('Extracting stories from HTML...');
            const stories = await this.extractStories(html);
            
            if (stories.length === 0) {
                console.log('No stories extracted, using fallback data...');
                return this.fallbackStories;
            }
            
            console.log(`Successfully extracted ${stories.length} stories`);
            return stories;
            
        } catch (error) {
            console.error('Error scraping stories:', error);
            console.log('Using fallback data due to error...');
            return this.fallbackStories;
        }
    }
}
