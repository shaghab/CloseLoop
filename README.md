# CloseLoop

Turn a selected workplace conversation into a decision, owned actions, open questions, risks, and a recommended next step.

## Run the demo

1. Install the server dependencies:
   ```bash
   cd server
   npm install
   ```
2. Create your local environment file and add your OpenAI API key:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `chrome://extensions` in Chrome.
5. Enable **Developer mode**.
6. Click **Load unpacked** and select the repository's `extension` directory.
7. Open Microsoft Teams Web.
8. Select a block of conversation text.
9. Click the **CloseLoop** extension.
10. Click **Analyze selected conversation**. Use **Copy closure message** to paste the result back into Teams.
