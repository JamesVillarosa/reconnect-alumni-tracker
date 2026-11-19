from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import random
import csv
import re
import os
import json
import datetime
from urllib.parse import urljoin
from dateutil import parser as date_parser

# Step 1: Set the base URL of the site you want to scrape
BASE_URL = "https://ics.uplb.edu.ph/news-and-updates/"

# Step 2: Setup Selenium WebDriver with improved options
def setup_selenium_driver():
    options = Options()
    options.add_argument("--headless")  # Run in headless mode
    options.add_argument("--disable-gpu")  # Disable GPU acceleration
    options.add_argument("--window-size=1920,1080")  # Set window size
    options.add_argument("--no-sandbox")  # Required for some environments
    options.add_argument("--disable-dev-shm-usage")  # Required for some environments
    options.add_argument("--disable-extensions")  # Disable extensions
    options.add_argument("--disable-infobars")  # Disable infobars
    options.add_experimental_option("excludeSwitches", ["enable-automation"])  # Disable automation flag
    options.add_experimental_option("useAutomationExtension", False)  # Disable automation extension
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
    
    # Create the driver instance
    driver = webdriver.Chrome(options=options)
    return driver

# Step 3: Fetch the HTML content of any page with Selenium and improved waiting
def fetch_html_with_selenium(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            driver = setup_selenium_driver()
            print(f"Opening URL: {url}")
            driver.get(url)
            
            # Wait for the page to load
            try:
                # Wait for at least the body element to be present
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                
                # Additional wait for dynamic content to load
                time.sleep(2 + random.uniform(1, 2))
                
                html = driver.page_source
                driver.quit()
                return html
            except Exception as e:
                print(f"Error waiting for page to load: {e}")
                driver.quit()
                if attempt < max_retries - 1:
                    wait_time = 2 * (attempt + 1) + random.uniform(1, 3)
                    print(f"Retrying in {wait_time:.2f} seconds...")
                    time.sleep(wait_time)
                else:
                    print(f"Failed to load page after {max_retries} attempts.")
                    return None
        except Exception as e:
            print(f"Error in Selenium: {e}")
            try:
                driver.quit()
            except:
                pass
            
            if attempt < max_retries - 1:
                wait_time = 2 * (attempt + 1) + random.uniform(1, 3)
                print(f"Retrying in {wait_time:.2f} seconds...")
                time.sleep(wait_time)
            else:
                print(f"Failed to load page after {max_retries} attempts.")
                return None
    
    return None

# Step 4: Extract article links from the main news page
def extract_article_links(html):
    soup = BeautifulSoup(html, "html.parser")
    links = []

    # Try multiple possible selectors
    potential_selectors = [
        "div.jet-smart-listing__post-title a",
        "h4.jet-smart-listing__post-title a",
        "div.elementor-posts article a",
        "div.post-title a",
        "h2.entry-title a",
        "div.news-item a",
        "article.post a.post-title",
        ".elementor-post__title a",  # Additional selector
        ".jet-listing-grid__item a"  # Additional selector
    ]
    
    for selector in potential_selectors:
        found_links = soup.select(selector)
        if found_links:
            print(f"Found links using selector: {selector}")
            for a_tag in found_links:
                href = a_tag.get("href")
                if href:
                    # Handle relative URLs
                    full_url = urljoin(BASE_URL, href)
                    # Filter URLs to ensure they're actually news articles
                    if any(term in full_url.lower() for term in ['/news-', '/announcement', '/updates']):
                        links.append(full_url)
            
            if links:  # If we found valid links, break out of the loop
                break
    
    if not links:
        print("Could not find any article links. Site structure may have changed.")
        # Fallback: look for any links that might contain news articles
        for a_tag in soup.find_all('a', href=True):
            href = a_tag.get("href")
            if href and any(term in href.lower() for term in ['/news-', '/announcement', '/updates']):
                full_url = urljoin(BASE_URL, href)
                links.append(full_url)
    
    # Remove duplicates while preserving order
    unique_links = []
    for link in links:
        if link not in unique_links:
            unique_links.append(link)
    
    return unique_links

# Step 5: Extract content from an individual article page with improved content detection
def extract_article_data(article_url):
    html = fetch_html_with_selenium(article_url)
    if not html:
        return None

    soup = BeautifulSoup(html, "html.parser")
    current_datetime = datetime.datetime.utcnow()
    
    # Try to extract title using multiple methods
    title = None
    title_selectors = [
        "div.jet-listing-dynamic-field__content",
        "h1.elementor-heading-title",
        "h1.entry-title",
        "h1.post-title",
        "article header h1",
        "div.post-header h1",
        ".elementor-widget-container h2",  # Additional selector
        ".jet-listing-dynamic-field__content"  # Additional selector
    ]
    
    for selector in title_selectors:
        title_elem = soup.select_one(selector)
        if title_elem and title_elem.text.strip():
            title = title_elem.text.strip()
            # Clean up title - remove extra whitespace and newlines
            title = re.sub(r'\s+', ' ', title).strip()
            break
    
    # If title is still not found, try a broader approach
    if not title:
        # Look for the largest heading (h1, h2, h3, etc.)
        for heading_tag in ['h1', 'h2', 'h3']:
            headings = soup.find_all(heading_tag)
            if headings:
                # Find the most prominent heading (usually the longest meaningful one)
                title = max(headings, key=lambda h: len(h.text.strip()) if len(h.text.strip()) < 200 else 0).text.strip()
                title = re.sub(r'\s+', ' ', title).strip()
                break
    
    # Extract the first image in the article
    image_url = None
    image_selectors = [
        "div.elementor-widget-container img",
        "div.entry-content img",
        "div.post-content img",
        "article img",
        ".elementor-image img",
        ".wp-block-image img",
        "figure img",
        ".featured-image img"
    ]
    
    for selector in image_selectors:
        images = soup.select(selector)
        for img in images:
            src = img.get('src') or img.get('data-src')
            if src and not src.endswith(('.svg', '.gif', '.ico')) and not re.search(r'(logo|icon|avatar|banner)', src.lower()):
                # Handle relative URLs
                image_url = urljoin(article_url, src)
                print(f"Found image: {image_url}")
                break
        if image_url:
            break
    
    # Extract content with improved methods
    # First try to find main content containers
    content = None
    content_selectors = [
        "div.elementor-container.elementor-column-gap-default",
        "div.elementor-widget-theme-post-content",
        "div.entry-content",
        "div.post-content",
        "article div.content",
        "div.post-body",
        ".elementor-widget-container",  # Additional selector
        ".elementor-text-editor"  # Additional selector
    ]
    
    # Try to extract the main content
    all_paragraphs = []
    for selector in content_selectors:
        content_elems = soup.select(selector)
        if content_elems:
            for elem in content_elems:
                # Get all paragraphs in this element
                paragraphs = elem.find_all('p')
                for p in paragraphs:
                    p_text = p.get_text(strip=True)
                    if p_text and len(p_text) > 20:  # Only include non-empty paragraphs
                        all_paragraphs.append(p_text)
            
            if all_paragraphs:
                break
    
    # If no paragraphs found, fall back to direct paragraph search
    if not all_paragraphs:
        print("Using fallback content extraction method...")
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            p_text = p.get_text(strip=True)
            if p_text and len(p_text) > 20:  # Only include non-empty paragraphs
                all_paragraphs.append(p_text)
    
    # Compile content from paragraphs
    if all_paragraphs:
        # Join paragraphs with proper spacing
        content = " | ".join(all_paragraphs)
        
        # Clean up content
        content = re.sub(r'\s+', ' ', content).strip()
        
        # Remove duplicate sentences or fragments
        sentences = content.split('. ')
        unique_sentences = []
        seen = set()
        for sentence in sentences:
            clean_sentence = sentence.strip().lower()
            if clean_sentence not in seen and clean_sentence:
                seen.add(clean_sentence)
                unique_sentences.append(sentence)
        
        content = '. '.join(unique_sentences)
        
        # Add periods back to sentences
        content = content.replace('. ', '.')
        content = content.replace('..', '.')
        content = content.replace(' |', '.')
        content = re.sub(r'\.+', '.', content)  # Replace multiple periods with single
        content = content.replace('|', '. ')    # Replace remaining | with periods
    else:
        content = "No content found"
    
    # Extract date using multiple methods
    date_str = None
    date_selectors = [
        "span.elementor-post-date",
        "span.post-date",
        "time.entry-date",
        "div.post-meta time",
        "div.entry-meta time"
    ]
    
    for selector in date_selectors:
        date_elem = soup.select_one(selector)
        if date_elem and date_elem.text.strip():
            date_str = date_elem.text.strip()
            date_str = re.sub(r'\s+', ' ', date_str).strip()
            break
    
    # If no date found using selectors, try to find a date pattern in the text
    if not date_str:
        # Look for date patterns in the text
        text = soup.get_text()
        date_patterns = [
            r'(\d{1,2})[-/\s](\d{1,2})[-/\s](\d{4})',  # DD-MM-YYYY or MM-DD-YYYY
            r'(\d{4})[-/\s](\d{1,2})[-/\s](\d{1,2})',  # YYYY-MM-DD
            r'([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})',   # Month DD, YYYY
            r'(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})'     # DD Month YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                date_str = match.group(0)
                break
    
    # Convert date string to date object
    date_obj = None
    if date_str and date_str != "No date found":
        try:
            # Use dateutil parser to handle various date formats
            date_obj = date_parser.parse(date_str)
        except Exception as e:
            print(f"Error parsing date '{date_str}': {e}")
            date_obj = None
    
    # Format for MongoDB document
    return {
        "_id": {"$oid": ""},  # This will be assigned by MongoDB
        "created_at": {"$date": current_datetime.isoformat() + "Z"},
        "updated_at": {"$date": current_datetime.isoformat() + "Z"},
        "authorId": {"$oid": "000000000000000000000000"},
        "title": title if title else "No title found",
        "description": content,
        "imageURL": image_url if image_url else "",
        "date": date_obj.isoformat() + "Z" if date_obj else None,
        "original_date_str": date_str if date_str else "No date found",
        "url": article_url,
        "commentId": {"$oid": "000000000000000000000000"}
    }

# Step 6: Save articles to CSV with improved formatting
def save_to_csv(articles, filename="uplb_ics_news.csv"):
    if not articles:
        print("No articles to save.")
        return
    
    try:
        # Ensure directory exists
        directory = os.path.dirname(filename)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['title', 'description', 'imageURL', 'date', 'url']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
            
            writer.writeheader()
            for article in articles:
                # Create a simplified dictionary for CSV export
                csv_row = {
                    'title': article['title'],
                    'description': article['description'],
                    'imageURL': article['imageURL'],
                    'date': article.get('date', ''),
                    'url': article.get('url', '')
                }
                
                # Ensure no newlines in any fields for CSV compatibility
                for key in csv_row:
                    if isinstance(csv_row[key], str):
                        # Replace newlines with spaces
                        csv_row[key] = csv_row[key].replace('\n', ' ').replace('\r', ' ')
                        # Normalize spaces
                        csv_row[key] = re.sub(r'\s+', ' ', csv_row[key]).strip()
                
                writer.writerow(csv_row)
        
        print(f"Successfully saved {len(articles)} articles to {filename}")
        return True
    except Exception as e:
        print(f"Error saving to CSV: {e}")
        return False

# Step 7: Save articles to JSON for backup with MongoDB format
def save_to_json(articles, filename="uplb_ics_news.json"):
    if not articles:
        print("No articles to save.")
        return
    
    try:
        # Ensure directory exists
        directory = os.path.dirname(filename)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)
        
        # Create a custom encoder for handling MongoDB date objects and ObjectIDs
        class MongoDBEncoder(json.JSONEncoder):
            def default(self, obj):
                if isinstance(obj, datetime.datetime):
                    return {"$date": obj.isoformat() + "Z"}
                return super(MongoDBEncoder, self).default(obj)
        
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(articles, jsonfile, indent=2, ensure_ascii=False, cls=MongoDBEncoder)
        
        print(f"Successfully saved {len(articles)} articles to {filename}")
        return True
    except Exception as e:
        print(f"Error saving to JSON: {e}")
        return False

# Step 8: For troubleshooting - save raw HTML
def save_raw_html(html, filename="debug_page.html"):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Raw HTML saved to {filename}")
    except Exception as e:
        print(f"Error saving raw HTML: {e}")

# Step 9: Format article content for better readability
def format_article_content(content):
    if not content or content == "No content found":
        return content
    
    # Split by sentences (accounting for abbreviations and other special cases)
    # This is a simplified approach - more sophisticated NLP could be used
    sentences = re.split(r'(?<=[.!?])\s+', content)
    
    # Filter out very short or duplicate sentences
    filtered_sentences = []
    seen = set()
    for sentence in sentences:
        cleaned = sentence.strip().lower()
        if cleaned and len(cleaned) > 10 and cleaned not in seen:
            seen.add(cleaned)
            filtered_sentences.append(sentence.strip())
    
    # Format as paragraphs (grouping related sentences)
    formatted_content = '. '.join(filtered_sentences)
    
    # Clean up any artifacts from the process
    formatted_content = re.sub(r'\.\s*\.', '.', formatted_content)  # Remove double periods
    formatted_content = re.sub(r'\s+', ' ', formatted_content).strip()  # Normalize spaces
    
    return formatted_content

# Step 10: Main scraping function with pagination support
def main():
    all_articles = []
    page_num = 1
    max_pages = 1  # Limiting to 1 page for demonstration
    debug_mode = True  # Set to False to disable debug outputs
    
    while page_num <= max_pages:
        # Some sites use different pagination patterns
        if page_num == 1:
            current_url = BASE_URL
        else:
            # Try common pagination patterns
            current_url = f"{BASE_URL}page/{page_num}/"
        
        print(f"\nFetching page {page_num}: {current_url}")
        html = fetch_html_with_selenium(current_url)
        
        if not html:
            print(f"Could not fetch page {page_num}. Stopping pagination.")
            break
        
        # For debugging - save the raw HTML
        if debug_mode:
            save_raw_html(html, f"debug_page_{page_num}.html")
        
        article_links = extract_article_links(html)
        print(f"Found {len(article_links)} article links on page {page_num}.")
        
        if not article_links:
            print("No more article links found. Stopping pagination.")
            break
        
        articles_on_page = 0
        for i, link in enumerate(article_links):
            print(f"Scraping article {i+1}/{len(article_links)}: {link}")
            
            # Random delay between requests (1-3 seconds)
            wait_time = 1 + random.uniform(0, 2)
            print(f"Waiting {wait_time:.2f} seconds before next request...")
            time.sleep(wait_time)
            
            article_data = extract_article_data(link)
            if article_data:
                # Format description for better readability
                if article_data['description']:
                    article_data['description'] = format_article_content(article_data['description'])
                
                all_articles.append(article_data)
                articles_on_page += 1
                
                # Print progress
                print(f"Title: {article_data['title']}")
                print(f"Image URL: {article_data['imageURL'] if article_data['imageURL'] else 'No image found'}")
                if article_data['date']:
                    print(f"Date: {article_data['date']}")
                print(f"Description preview: {article_data['description'][:100]}...")
                print("-" * 50)
        
        # Stop if we didn't find any articles on this page
        if articles_on_page == 0:
            print("No articles found on this page. Stopping pagination.")
            break
            
        page_num += 1
        
        # Add a larger delay between pages
        if page_num <= max_pages:
            page_delay = 3 + random.uniform(1, 3)
            print(f"Moving to next page in {page_delay:.2f} seconds...")
            time.sleep(page_delay)
    
    # Save results in multiple formats for redundancy
    print(f"\nTotal articles scraped: {len(all_articles)}")
    
    # Create MongoDB compatible documents by removing temporary fields
    mongo_articles = []
    for article in all_articles:
        # Create a deep copy of the article to avoid modifying the original
        mongo_article = article.copy()
        # Remove temporary fields not needed in MongoDB
        if 'original_date_str' in mongo_article:
            del mongo_article['original_date_str']
        if 'url' in mongo_article:
            del mongo_article['url']
        mongo_articles.append(mongo_article)
    
    csv_success = save_to_csv(all_articles)  # Keep original format for CSV
    json_success = save_to_json(mongo_articles)  # Use MongoDB format for JSON
    
    # Print a preview of the scraped data
    print("\nPreview of scraped articles:")
    for i, article in enumerate(all_articles[:3]):  # Show only first 3 articles
        print(f"\n{i+1}. {article['title']}")
        if 'url' in article:
            print(f"URL: {article['url']}")
        print(f"Image URL: {article['imageURL'] if article['imageURL'] else 'No image found'}")
        if article['date']:
            print(f"Date: {article['date']}")
        print("---")
        print(f"Description preview: {article['description'][:200]}...")
    
    return all_articles

if __name__ == "__main__":
    main()