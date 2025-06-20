Lens MIND - AI Photography Prompt Generator
"Lens MIND" is a web application designed to help photographers and AI enthusiasts generate high-quality, professional AI prompts for image generation models like Gemini AI. Users can input simple descriptions, get draft images, refine them through iterative feedback, and finally obtain a detailed, optimized AI prompt that considers various photographic elements.
Use this for professional headshots, celebratory photos, vacation photos, and anywhere your imagination leads you.
FeaturesIntuitive Interface: Easily describe your desired image.Draft Image Generation: Get quick visual feedback with initial image drafts.Iterative Refinement: Modify drafts based on your preferences.AI-Powered Prompt Optimization: Generate highly detailed prompts considering camera settings, lighting, composition, and artistic intent.Optimized for Gemini AI: Prompts are crafted for best results with Gemini AI's image generation capabilities.Getting StartedFollow these steps to set up and run the project locally.PrerequisitesMake sure you have the following installed on your machine:Node.js (LTS version recommended)npm (comes with Node.js) or YarnInstallationClone the repository:git clone https://github.com/your-username/lens-mind-app.git
cd lens-mind-app
(Note: Replace https://github.com/your-username/lens-mind-app.git with your actual repository URL once you create it.)Install dependencies:npm install
# or
yarn install
Running the App LocallyTo run the app in development mode:npm start
# or
yarn start
This will open the application in your browser at http://localhost:3000. The page will reload if you make edits. You will also see any lint errors in the console.Building for ProductionTo build the app for production to the build folder:npm run build
# or
yarn build
This command bundles React in production mode and optimizes the build for the best performance. The build is minified, and the filenames include the hashes. Your app is ready to be deployed!DeploymentThe build folder contains the static assets ready for deployment. You can deploy this to any static hosting service like:GitHub PagesNetlifyVercelFirebase HostingAmazon S3For GitHub Pages:Ensure your package.json has a homepage field pointing to your GitHub Pages URL (e.g., "homepage": "https://your-username.github.io/your-repo-name").Install gh-pages:npm install --save-dev gh-pages
# or
yarn add --dev gh-pages
Add the following scripts to your package.json:"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
Run the deploy script:npm run deploy
# or
yarn deploy
This will push the contents of your build directory to the gh-pages branch of your repository.Project Structurelens-mind-app/
├── public/
│   ├── index.html         // Main HTML file
│   └── ...                // Other static assets (e.g., logo, favicon)
├── src/
│   ├── App.js             // Main React application component
│   ├── index.js           // React entry point
│   └── ...                // Other components/assets if added later
├── .gitignore             // Specifies intentionally untracked files to ignore
├── package.json           // Project metadata and dependencies
├── README.md              // This file
└── ...
ContributingFeel free to fork the repository and contribute!
  @media print {
    .ms-editor-squiggler {
        display:none !important;
    }
  }
  .ms-editor-squiggler {
    all: initial;
    display: block !important;
    height: 0px !important;
    width: 0px !important;
  }
