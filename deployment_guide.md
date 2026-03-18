# Hostinger Deployment Guide: BFS Secure Payment Gateway Keys

To make the BFS payment gateway work on Hostinger, you need to store your RSA keys as environment variables. This is more secure and reliable than uploading `.pem` files.

## Step 1: Prepare your Keys
Open your `.pem` files in a text editor (like Notepad). You will need the full content, including headers:

**Private Key (`merchant_private.pem`):**
```text
-----BEGIN RSA PRIVATE KEY-----
... lines of code ...
-----END RSA PRIVATE KEY-----
```

**Public Key (`bfs_public.pem`):**
```text
-----BEGIN PUBLIC KEY-----
... lines of code ...
-----END PUBLIC KEY-----
```

## Step 2: Add to Hostinger hPanel

### Method A: Using hPanel UI (Shared Hosting / Node.js)
1.  Log in to your **Hostinger hPanel**.
2.  Go to **Websites** and click **Manage** on your site.
3.  Search for **Environment Variables** in the sidebar.
4.  Add the following two variables:

| Key | Value |
| :--- | :--- |
| `BFS_PRIVATE_KEY` | (Paste the full content of your private key) |
| `BFS_PUBLIC_KEY` | (Paste the full content of the BFS public key) |

> [!IMPORTANT]
> If the hPanel UI doesn't support multi-line text, you can replace the newlines with `\n` (literal backslash and 'n') into a single line string. My code is updated to handle both formats.

### Method B: Using `.env` file (VPS or direct access)
If you have access to the server files, add them to your production `.env` file:

```env
BFS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
BFS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG...\n-----END PUBLIC KEY-----"
```

### Method C: Splitting Keys (Hostinger Shared Hosting)
If Hostinger limits the length of environment variables, you can split your key into two or more parts. My code will automatically join them if they follow the `_P1`, `_P2` naming convention:

| Key | Value |
| :--- | :--- |
| `BFS_PRIVATE_KEY_P1` | (First half of the key) |
| `BFS_PRIVATE_KEY_P2` | (Second half of the key) |
| `BFS_PUBLIC_KEY_P1` | (First half of the public key) |
| `BFS_PUBLIC_KEY_P2` | (Second half of the public key) |

## Step 3: Verify
Restart your application after adding the environment variables. The system will now use these variables automatically instead of looking for files in the `./keys` folder.
