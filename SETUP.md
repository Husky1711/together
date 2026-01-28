# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Personalize Your App**
   
   Open `lib/personalization.ts` and update:
   - `herName`: Her name
   - `yourName`: Your name
   - `relationshipStartDate`: When you started dating (format: "YYYY-MM-DD")
   - `valentinesDate`: Valentine's Day date
   - `milestones`: Important dates in your relationship
   - `insideJokes`: Your inside jokes
   - `heroMessage`: Personalized message for hero section
   - `closingMessage`: Closing message
   - `questions`: Customize questions and answers

3. **Add Your Photos**
   
   - Add photos to `public/images/` directory
   - Update `components/PhotoGallery.tsx`:
     - Replace the `photos` array with your actual photos
     - Update `src` paths to match your image filenames
     - Add personalized captions

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to http://localhost:3000

## Personalization Tips

### Adding Photos
1. Place photos in `public/images/` folder
2. Recommended formats: WebP, JPG, PNG
3. Optimize images for web (use tools like TinyPNG)
4. Update the `photos` array in `PhotoGallery.tsx`:

```typescript
const photos: Photo[] = [
  {
    id: 1,
    src: '/images/your-photo-1.jpg',
    caption: 'Your personalized caption here',
    category: 'memories', // or 'goals' or 'dreams'
  },
  // Add more photos...
]
```

### Customizing Questions
Edit the `questions` array in `lib/personalization.ts`:

```typescript
questions: [
  {
    question: "Your custom question?",
    emojis: ["😊", "💕", "✨", "🎉"],
    answers: {
      "😊": "Your personalized answer for this emoji",
      "💕": "Another personalized answer",
      // Add more...
    },
  },
]
```

### Color Customization
If you want different colors, update in `lib/personalization.ts`:

```typescript
colors: {
  primary: "#F4A6C1", // Soft Rose
  secondary: "#E8979D", // Blush Pink
  accent: "#D4A574", // Rose Gold
}
```

## Building for Production

```bash
npm run build
npm start
```

## Deploying

### Vercel (Recommended)
1. Push to GitHub
2. Import project on Vercel
3. Deploy automatically

### Other Platforms
- Netlify
- AWS Amplify
- Any Node.js hosting

## PWA Setup

The app is PWA-ready. To add app icons:
1. Create `public/icon-192.png` (192x192px)
2. Create `public/icon-512.png` (512x512px)
3. The manifest.json is already configured

## Need Help?

Check the main README.md for more details.

