# CloseLoop

Turn a selected workplace conversation into a decision, owned actions, open questions, risks, and a recommended next step.

## Run the demo

1. Install the server dependencies:
   ```bash
   cd server
   npm install
   ```
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and select the repository's `extension` directory.
4. Copy the ID shown for CloseLoop.
5. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
6. In `.env`, add your OpenAI API key and replace `your_extension_id` with the copied ID.
7. Start the server:
   ```bash
   npm start
   ```
8. Open Microsoft Teams Web and select a block of conversation text.
9. Click the **CloseLoop** extension.
10. Click **Analyze selected conversation**. Use **Copy closure message** to paste the result back into Teams.

## Track follow-up progress

1. Analyze the original conversation and click **Track this**. This replaces any previously tracked discussion.
2. Select the text of a later conversation about the same discussion.
3. Open CloseLoop and click **Check progress**.
4. Review which original actions are done, open, or unclear, plus any new decisions, risks, and the suggested next step.
5. Click **Stop tracking** when finished.

The single tracked discussion is stored only in `chrome.storage.local`.
