import {test, expect} from '../fixtures';

test.describe('Quotation Notes', () => {
  test.beforeEach(async ({login, navigatePW, waitForSpinnerToDisappear}) => {
    await login();
    navigatePW('finance', 'quotations');
    await waitForSpinnerToDisappear();
  });

  test('should test notes on quotations listing', async ({page}) => {
    // select quotation that don't have notes
    const quotationRowWithoutNote = page
      .locator(
        'tr[data-testid^="quotation-row"]:has([data-testid="NoteAltOutlinedIcon"])',
      )
      .nth(2);

    const quotationNumber =
      (await quotationRowWithoutNote
        .locator('td[data-field="EXTERNAL_ID"]')
        .textContent()) || '';

    const getQuotationRowByNumber = (number: string) =>
      page.locator(`text=${number}`).locator('xpath=ancestor::tr');

    await quotationRowWithoutNote
      .locator('[data-testid="NoteAltOutlinedIcon"]')
      .click();

    await expect(
      page.locator('text=No notes yet. They will appear here once added.'),
    ).toBeVisible();

    // add note
    const noteInput = page.locator('textarea[name="note"]');
    await noteInput.fill('Test note');

    const submitButton = page.locator('button:has-text("Submit note")');
    await expect(submitButton).toBeEnabled();

    // Wait for the POST request to complete
    const addNoteResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/quotations') &&
        resp.url().includes('/comments') &&
        resp.request().method() === 'POST',
    );

    await submitButton.click();

    await addNoteResponse;

    await expect(page.locator('text=Test note')).toBeVisible();

    // edit note
    const editButton = page.locator('[data-testid="EditIcon"]');
    await editButton.click();

    await noteInput.fill('Test note 2');

    // Wait for the PUT request to complete
    const editNoteResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/quotations') &&
        resp.url().includes('/comments') &&
        resp.request().method() === 'PUT',
    );

    await submitButton.click();

    await editNoteResponse;

    await expect(page.locator('text=Test note 2')).toBeVisible();

    // close drawer
    await page.locator('button:has-text("Close")').click();

    // Wait for the drawer to close completely
    await expect(page.locator('textarea[name="note"]')).not.toBeVisible();

    // wait for the icon to change from outlined to filled
    // Use waitFor to give more time for the icon state to update after adding note
    await page.waitForFunction((quotationNum) => {
      // Find all table rows and check their content
      const rows = Array.from(
        document.querySelectorAll('tr[data-testid^="quotation-row"]'),
      );
      const targetRow = rows.find((row) => {
        const cells = Array.from(row.querySelectorAll('td'));
        return cells.some(
          (cell) => cell.textContent && cell.textContent.includes(quotationNum),
        );
      });

      if (targetRow) {
        const filledIcon = targetRow.querySelector(
          '[data-testid="NoteAltIcon"]',
        );
        const outlinedIcon = targetRow.querySelector(
          '[data-testid="NoteAltOutlinedIcon"]',
        );

        return filledIcon && !outlinedIcon;
      }
      return false;
    }, quotationNumber);

    // reopen notes drawer (note icon should be filled)
    await getQuotationRowByNumber(quotationNumber)
      .locator('[data-testid="NoteAltIcon"]')
      .click();

    // Wait for drawer to open
    await expect(page.locator('textarea[name="note"]')).toBeVisible();

    const deleteResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/quotations') &&
        resp.url().includes('/comments/') &&
        resp.request().method() === 'DELETE',
    );

    // delete note
    await page.locator('[data-testid="DeleteOutlineIcon"]').click();

    await page.locator('button:has-text("Delete note")').click();

    await deleteResponse;

    await page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/quotations') &&
        resp.request().method() === 'GET',
    );

    await expect(
      page.locator('text=No notes yet. They will appear here once added.'),
    ).toBeVisible();

    // close drawer
    await page.locator('button:has-text("Close")').click();

    // Wait for the drawer to close completely
    await expect(page.locator('textarea[name="note"]')).not.toBeVisible();

    // note icon should be empty
    // Use waitFor to give more time for the icon state to update after deletion
    await page.waitForFunction((quotationNum) => {
      // Find all table rows and check their content
      const rows = Array.from(
        document.querySelectorAll('tr[data-testid^="quotation-row"]'),
      );
      const targetRow = rows.find((row) => {
        const cells = Array.from(row.querySelectorAll('td'));
        return cells.some(
          (cell) => cell.textContent && cell.textContent.includes(quotationNum),
        );
      });

      if (targetRow) {
        const filledIcon = targetRow.querySelector(
          '[data-testid="NoteAltIcon"]',
        );
        const outlinedIcon = targetRow.querySelector(
          '[data-testid="NoteAltOutlinedIcon"]',
        );

        return !filledIcon && outlinedIcon;
      }
      return false;
    }, quotationNumber);
  });

  test('should test notes on quotation details page', async ({page}) => {
    const getResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/quotations/') &&
        resp.request().method() === 'GET',
    );

    // click on quotation to go to details page
    await page
      .locator(
        'tr[data-testid^="quotation-row"]:has([data-testid="NoteAltOutlinedIcon"])',
      )
      .nth(3)
      .click();

    // wait for quotation details page to load
    await getResponsePromise;

    // find and click notes icon on details page
    const notesIcon = page
      .locator(
        '[data-testid="NoteAltOutlinedIcon"], [data-testid="NoteAltIcon"]',
      )
      .first();
    await notesIcon.click();

    // check if notes drawer opens
    await expect(
      page.locator('text=No notes yet. They will appear here once added.'),
    ).toBeVisible();

    // add note
    const noteInput = page.locator('textarea[name="note"]');
    await noteInput.fill('Quotation details test note');

    const submitButton = page.locator('button:has-text("Submit note")');
    await expect(submitButton).toBeEnabled();

    // Wait for the POST request to complete
    const addNoteResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/quotations') &&
        resp.url().includes('/comments') &&
        resp.request().method() === 'POST',
    );

    await submitButton.click();

    await addNoteResponse;

    await expect(
      page.locator('text=Quotation details test note'),
    ).toBeVisible();

    // edit note
    const editButton = page.locator('[data-testid="EditIcon"]');
    await editButton.click();

    await noteInput.fill('Updated quotation details note');

    // Wait for the PUT request to complete
    const editNoteResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/quotations') &&
        resp.url().includes('/comments') &&
        resp.request().method() === 'PUT',
    );

    await submitButton.click();

    await editNoteResponse;

    await expect(
      page.locator('text=Updated quotation details note'),
    ).toBeVisible();

    const deleteResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/quotations') &&
        resp.url().includes('/comments/') &&
        resp.request().method() === 'DELETE',
    );

    // delete note
    await page.locator('[data-testid="DeleteOutlineIcon"]').click();

    await page.locator('button:has-text("Delete note")').click();

    await deleteResponse;

    await expect(
      page.locator('text=No notes yet. They will appear here once added.'),
    ).toBeVisible();
  });

  test('should sort quotations by notes column', async ({page}) => {
    // find notes column header
    const notesColumnHeader = page.locator('th:has-text("Notes")');
    await expect(notesColumnHeader).toBeVisible();

    // Helper function to get current sort order
    const getCurrentOrder = async () => {
      const icons = await page
        .locator(
          'tr[data-testid^="quotation-row"] [data-field="NOTES"] [data-testid]',
        )
        .all();
      return Promise.all(
        icons.map(async (icon) => icon.getAttribute('data-testid')),
      );
    };

    // Get initial order to check if we have mixed note types
    const initialOrder = await getCurrentOrder();
    const hasFilledNotes = initialOrder.includes('NoteAltIcon');
    const hasOutlinedNotes = initialOrder.includes('NoteAltOutlinedIcon');

    // Skip test if we don't have sufficient data variation
    if (initialOrder.length <= 1 || !hasFilledNotes || !hasOutlinedNotes) {
      await expect(notesColumnHeader).toBeVisible();
      return;
    }

    // Hover over the notes column header to make the sort button visible
    await notesColumnHeader.hover();

    // Find sort button inside notes column header (it becomes visible on hover)
    const notesSortButton = notesColumnHeader.locator('button');
    await expect(notesSortButton).toBeVisible();

    // Wait for first sort response
    const firstSortResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/quotations') &&
        resp.request().method() === 'GET',
    );

    // click on notes sort button to sort ascending
    await notesSortButton.click();

    // wait for sort to complete and DOM to update
    await firstSortResponse;

    // Wait for DOM to stabilize after sort
    await page.waitForTimeout(500);

    // get notes icons after first sort
    const ascendingOrder = await getCurrentOrder();

    // Hover again to make the sort button visible for second click
    await notesColumnHeader.hover();

    // Wait for second sort response
    const secondSortResponse = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/quotations') &&
        resp.request().method() === 'GET',
    );

    // click again to sort descending
    await notesSortButton.click();

    // wait for sort to complete and DOM to update
    await secondSortResponse;

    // Wait for DOM to stabilize after sort
    await page.waitForTimeout(500);

    // get notes icons after second sort
    const descendingOrder = await getCurrentOrder();

    // verify that clicking sort button changes the order
    const hasDifferentItems = ascendingOrder.some(
      (item, index) => item !== descendingOrder[index],
    );

    // Assert that the order should change when we have mixed note types
    expect(hasDifferentItems).toBeTruthy();
  });

  test('should filter quotations by "Quote(s) with notes"', async ({page}) => {
    // Find and click the filter button/dropdown
    const filterButton = page.locator('[data-testid="FilterListIcon"]').first();
    await filterButton.click();

    // Look for "Quote(s) with notes" filter option and click it
    const notesFilterOption = page.locator(
      '[data-testid="quotation-filter-note-checkbox"]',
    );
    await notesFilterOption.click();

    const response = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/quotations') &&
        resp.url().includes('hasComments=true') &&
        resp.request().method() === 'GET',
    );

    await page.locator('button:has-text("Show Results")').click();

    await response;

    // Verify that all visible quotations have notes (filled icons)
    const getAllQuotationRows = () =>
      page.locator('tr[data-testid^="quotation-row"]');

    const quotationRows = await getAllQuotationRows().all();

    // Check each row individually to ensure it has the correct note icon
    await Promise.all(
      quotationRows.map(async (row) => {
        // Each row should have a filled note icon (indicating it has notes)
        await expect(row.locator('[data-testid="NoteAltIcon"]')).toBeVisible();

        // Each row should NOT have an outlined note icon (indicating no notes)
        await expect(
          row.locator('[data-testid="NoteAltOutlinedIcon"]'),
        ).not.toBeVisible();
      }),
    );
  });
});
