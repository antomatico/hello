# Login logging — one-time setup (about 5 minutes)

This connects your site's login to the Google Sheet **"Ants Portfolio — Login Log"**
(already created in your Drive folder). After setup, every login is recorded to the
sheet, and `loginhistory.html` shows the list.

Your sheet:
https://docs.google.com/spreadsheets/d/1tdS7A7veK83k8x763EZS14PHBYwvbzCXVZABl2pRUn4/edit

## 1. Add the script to the sheet
1. Open the sheet (link above).
2. Menu: **Extensions → Apps Script**. A code editor opens in a new tab.
3. Delete whatever is in `Code.gs`, then paste the entire contents of
   **login-logging-appscript.gs** (in this folder).
4. Click the **Save** icon (disk).

## 2. Deploy it as a Web App
1. Top-right: **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set:
   - **Description:** anything (e.g. "login log")
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone**   ← important, or the site can't reach it
4. Click **Deploy**. Approve the permissions when Google asks
   (it's your own script writing to your own sheet).
5. Copy the **Web app URL**. It ends in **`/exec`**.

## 3. Paste the URL into the site
1. Open **assets/auth.js**.
2. Find this line near the top:
   ```
   var LOGGING_ENDPOINT = "";
   ```
3. Put your `/exec` URL between the quotes, e.g.:
   ```
   var LOGGING_ENDPOINT = "https://script.google.com/macros/s/AKfy...../exec";
   ```
4. Save. Re-upload / re-deploy the site (or just save locally if testing).

That's it. Log in once to test, then open **loginhistory.html** and sign in —
your visit should appear. New logins show up when you click **Refresh**.

## Notes
- The log records: time, the email entered, which page, the visitor's timezone,
  and a short browser/OS string. No IP address (a static page can't read that reliably).
- To change the password or allowed emails later, that's still all in `assets/auth.js`.
- If you ever redeploy the Apps Script as a **new** deployment, the `/exec` URL changes —
  paste the new one into `auth.js`. (Using **Deploy → Manage deployments → Edit** keeps the same URL.)
- Reminder: the login itself is a front-end courtesy gate, not hard security. The logging
  is accurate for anyone who actually signs in through the page.
