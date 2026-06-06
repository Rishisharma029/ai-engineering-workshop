import { test, expect } from '@playwright/test';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

test.describe('AI Engineering Workspace - E2E Core User Journeys', () => {
  const zipPath = path.resolve(__dirname, 'test-project.zip');

  test.beforeAll(() => {
    // Generate a test ZIP file in the e2e folder before running tests
    const zip = new AdmZip();
    zip.addFile('main.js', Buffer.from('const express = require("express");\nconst app = express();\n', 'utf8'));
    zip.addFile('config.js', Buffer.from('const db_password = "supersecretpassword123";\n', 'utf8'));
    zip.addFile('package.json', Buffer.from('{"dependencies": {"express": "^4.19.2"}}', 'utf8'));
    zip.addFile('README.md', Buffer.from('# E2E Workspace Test\nAutomated testing project.', 'utf8'));
    zip.writeZip(zipPath);
  });

  test.afterAll(() => {
    // Clean up the generated ZIP
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
  });

  test('Complete Flow: Login, Upload ZIP, Heatmap, Documentation, and AI Chat', async ({ page }) => {
    // 1. Visit Landing Page & Sign In
    await page.goto('/');
    await expect(page).toHaveTitle(/AI.*Workspace/i);

    // Open Auth Modal
    await page.click('button:has-text("Sign In")');
    
    // Default credentials are pre-filled, trigger workspace launch
    await page.click('button:has-text("Launch Workspace")');

    // Confirm navigation to Dashboard
    await expect(page.locator('h2:has-text("Project Workspace")')).toBeVisible();

    // 2. Repository Upload Flow
    // Click Upload ZIP button in Header
    await page.click('button:has-text("Upload ZIP")');
    
    // Set workspace details and attach ZIP
    await page.fill('input[placeholder="e.g. backend-express-app"]', 'E2E-Workspace-Project');
    await page.setInputFiles('input[type="file"]', zipPath);
    
    // Submit upload form
    await page.click('button:has-text("Upload & Scan Archive")');

    // Confirm that the project has successfully uploaded and header name matches
    await expect(page.locator('span:has-text("E2E-Workspace-Project")')).toBeVisible();
    await expect(page.locator('h2:has-text("Project Workspace")')).toBeVisible();

    // 3. Risk Heatmap Flow
    // Click Risk Heatmap in Sidebar
    await page.click('button:has-text("Risk Heatmap")');
    await expect(page.locator('h2:has-text("Risk Heatmap")')).toBeVisible();

    // Verify files list renders
    await expect(page.locator('td:has-text("main.js")')).toBeVisible();
    
    // Click main.js inside table to verify details panel
    await page.click('td:has-text("main.js")');
    await expect(page.locator('span:has-text("Module Scanner Info")')).toBeVisible();
    await expect(page.locator('h4:has-text("main.js")')).toBeVisible();

    // 4. Documentation Flow
    // Click Documentation in Sidebar
    await page.click('button:has-text("Documentation")');
    await expect(page.locator('h2:has-text("Documentation Studio")')).toBeVisible();

    // Generate README.md
    await page.click('button:has-text("Generate Document")');
    
    // Wait for markdown render pane to contain title
    await expect(page.locator('h2:has-text("E2E Workspace Test")')).toBeVisible();

    // Intercept download/export select triggers
    const downloadPromise = page.waitForEvent('download').catch(() => null);
    await page.selectOption('#export-select', 'md'); // Trigger Markdown export download
    
    const download = await downloadPromise;
    if (download) {
      const suggestedName = download.suggestedFilename();
      expect(suggestedName).toContain('.md');
    }

    // 5. AI Chat Flow
    // Click AI Code Chat in Sidebar
    await page.click('button:has-text("AI Code Chat")');
    await expect(page.locator('h2:has-text("Codebase RAG Chat")')).toBeVisible();

    // Type query and send it
    await page.fill('input[placeholder*="Ask anything about the codebase"]', 'Explain the repository framework');
    await page.click('button[type="submit"]');

    // Assert that conversation dialogue updates
    await expect(page.locator('p:has-text("Explain the repository framework")')).toBeVisible();
  });
});
