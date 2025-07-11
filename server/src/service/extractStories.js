export function extractStories(xml) {
  const stories = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g; // i am using a regex to match the item tags
  let match;
  while ((match = itemRegex.exec(xml)) !== null && stories.length < 6) {
    const item = match[1];

    // I am using regex to extract title and link from the item
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : null; // here if titleMatch[1] is null, we use titleMatch[2]
    const link = linkMatch ? linkMatch[1] : null; // here if linkMatch is null, we use null
    if (title && link) {
      stories.push({ title: title.trim(), link: link.trim() }); // I am trimming the title and link to remove any extra spaces
    }
  }
  console.log(`Extracted ${stories.length} stories`);
  return stories;
}