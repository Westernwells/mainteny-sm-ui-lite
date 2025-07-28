import {test, expect} from '../fixtures';

test.describe('Create Quotation', () => {
  test.beforeEach(async ({page, login, navigatePW}) => {
    await login();

    await navigatePW('finance', 'quotations');

    await page.locator('button:has-text("New Quotation")').click();
  });

  test('should add new customer on quotation page', async ({page}) => {
    await page.locator('button:has-text("Add New Customer")').click();
    const outside = page.locator('#alert-dialog-title');

    await page.locator('input[name="name"]').clear();
    await outside.click();
    await expect(page.locator('text=Customer Name is required')).toBeVisible();
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();

    await page.locator('input[name="name"]').fill('Test Company');

    await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();

    await page.locator('button:has-text("Next")').click();

    await expect(
      page.locator('input[name="billingAddress.component.name"]'),
    ).toHaveValue('Test Company');

    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Submit")').click();
    await expect(
      page.locator('text=Customer created successfully'),
    ).toBeVisible();

    await expect(page.locator('input[name="propertyOwnerId"]')).toHaveValue(
      'Test Company',
    );
  });

  test('should create new unit on quotation page', async ({page}) => {
    await page.locator('button:has-text("Add New Unit")').click();

    // Wait for dialog to open and load
    await page.locator('button:has-text("Next")').waitFor({state: 'visible'});
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();

    // Wait for customer table to load and select first customer
    await page
      .locator('div[data-colindex="1"]')
      .nth(1)
      .waitFor({state: 'visible'});

    // Click on the first customer cell (column index 1) to select the row
    await page.locator('div[data-colindex="1"]').nth(1).click();

    // Wait for potential data loading triggered by row selection

    // Verify the Next button is now enabled (wait up to 10s)
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeEnabled();

    await page.locator('button:has-text("Next")').click();

    // Wait for address form to load
    await page
      .locator('input[name="address.fullName"]')
      .waitFor({state: 'visible'});
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();

    const outside = page.locator('#alert-dialog-title');

    await page.locator('input[name="address.fullName"]').clear();
    await outside.click();
    await expect(page.locator('text=Address is required')).toBeVisible();

    const addressInput = page.locator('input[name="address.fullName"]');
    await addressInput.pressSequentially('33 Kehinde', {delay: 500});

    // Wait for autocomplete results to load - more robust approach
    const addressOption = page.locator('text=33 Kehinde Owolabi').first();
    await addressOption.waitFor({state: 'visible'});

    await expect(
      page.locator('text=Address not found. Please check and try again'),
    ).not.toBeVisible();

    await addressOption.click();

    await expect(
      page.locator('input[name="address.component.city"]'),
    ).toHaveValue('Lagos');

    await expect(
      page.locator('input[name="address.component.postalCode"]'),
    ).toHaveValue('102213');

    await expect(
      page.locator('input[name="address.component.country"]'),
    ).toHaveValue('Nigeria');

    await expect(
      page.locator('input[name="address.component.state"]'),
    ).toHaveValue('Lagos');

    await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();
    await page.locator('button:has-text("Next")').click();

    // Wait for category form to load
    await page.locator('input[name="category"]').waitFor({state: 'visible'});
    await page.locator('input[name="category"]').click();

    // Wait for category options to load
    await page
      .locator('li[role="option"]:has-text("Escalator")')
      .waitFor({state: 'visible'});
    await page.locator('li[role="option"]:has-text("Escalator")').click();
    await expect(page.locator('input[name="category"]')).toHaveValue(
      'Escalator',
    );
    await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();
    await page.locator('button:has-text("Next")').click();

    // Wait for service form to load
    await page
      .locator('input[name="technicianNumber"]')
      .waitFor({state: 'visible'});
    await page.locator('input[name="serviceTime"]').waitFor({state: 'visible'});

    await page.locator('input[name="technicianNumber"]').fill('3');
    await page.locator('input[name="serviceTime"]').fill('30');

    await page
      .locator('input[name="lastVisitDate"]')
      .waitFor({state: 'visible'});
    await page.locator('input[name="lastVisitDate"]').fill('07.07.2025');

    await expect(page.locator('button:has-text("Next")')).not.toBeDisabled();

    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Next")').click();

    const postElevatorAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/elevators') &&
        resp.request().method() === 'POST',
    );
    await page.locator('button:has-text("Create Unit")').click();

    await expect(page.locator('text=Unit created successfully')).toBeVisible();
    const postElevatorResponse = await postElevatorAPIPromise;
    const request = JSON.parse(
      postElevatorResponse.request().postData() as string,
    );

    await expect(
      page.locator(`text=${request?.address?.fullName}`),
    ).toBeVisible();
  });

  test('should create job from quotation page', async ({page}) => {
    // Create quotation

    // Select customer
    await page
      .locator('input[role="combobox"][name="propertyOwnerId"]')
      .locator('..')
      .click();

    // Wait for customer options to load
    await page
      .locator('li[role="option"][id="combo-box-demo-option-0"]')
      .waitFor({state: 'visible'});

    await page
      .locator('li[role="option"][id="combo-box-demo-option-0"]')
      .click();

    // Add article
    const articleField = page.locator('[data-testid="article-name-0"]');
    await articleField.waitFor({state: 'visible'});
    await articleField.click();
    await articleField.click(); // Double-click without force

    const articleComboBox = page.locator('#article-combo-box');
    await expect(articleComboBox).toBeVisible();
    await articleComboBox.clear();
    await articleComboBox.fill('article');

    // Press Enter to create a free-text article position
    await page.keyboard.press('Enter');

    // Set unit amount
    const unitAmountField = page.locator(
      '[data-testid="position-unitAmount-0"]',
    );
    await unitAmountField.waitFor({state: 'visible'});
    await unitAmountField.click();
    await unitAmountField.click(); // Double-click without force

    const unitAmountInput = page.locator(
      'input[name="items.0.unitAmount.netAmount"]',
    );
    await unitAmountInput.waitFor({state: 'visible'});
    await unitAmountInput.fill('100');
    await unitAmountInput.blur();

    // Locate the subject rich text field via its legend and type some text
    const subjectField = page
      .locator('legend:has-text("Subject")')
      .locator('..') // fieldset
      .locator('[contenteditable="true"]');
    await subjectField.waitFor({state: 'visible'});
    await subjectField.type('Test Quotation Subject');

    // Save quotation
    await expect(page.locator('button:has-text("Save")')).toBeEnabled();
    await page.locator('button:has-text("Save")').click();
    await expect(
      page.locator('text=Quotation created successfully'),
    ).toBeVisible();

    // Send quotation
    const sendQuotationAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/quotations/') &&
        resp.url().includes('/send') &&
        resp.request().method() === 'POST',
    );

    await page.locator('button:has-text("Send")').click();

    // Wait for email dialog to open
    await page.locator('label:has-text("Send to")').waitFor({state: 'visible'});

    await page.locator('label:has-text("Send to")').click();
    await page.keyboard.type('noman+1@mainteny.com');
    await page.keyboard.press('Enter');

    // Wait for rich text editor to be ready
    const richTextEditor = page.locator('div[contenteditable="true"]');
    await richTextEditor.waitFor({state: 'visible'});
    await richTextEditor.fill('I am Text!');

    await page.locator('button:has-text("Send email")').click();

    const sendResponse = await sendQuotationAPIPromise;
    expect(sendResponse.status()).toBe(200);
    await expect(
      page.locator('text=Quotation sent successfully'),
    ).toBeVisible();

    // Create job
    const createJobAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceOrders') &&
        resp.request().method() === 'POST',
    );

    await page.locator('button:has-text("Create Job")').click();

    // Wait for job creation dialog to open
    await page
      .locator('button:has-text("Select Unit")')
      .waitFor({state: 'visible'});

    const getUnitsAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/propertyOwners/') &&
        resp.url().includes('/elevators') &&
        resp.request().method() === 'GET',
    );

    await page.locator('button:has-text("Select Unit")').click();

    // Wait for search input to be ready
    await page.locator('input[name="Search"]').waitFor({state: 'visible'});

    await page.locator('input[name="Search"]').clear();
    await page.locator('input[name="Search"]').fill('e');

    await getUnitsAPIPromise;

    // Wait for units to load in the table
    await page.locator('div[data-rowindex="0"]').waitFor({state: 'visible'});

    await page.locator('div[data-rowindex="0"]').click();
    await page.locator('button:has-text("Select")').click();

    await page.locator('div[role="combobox"][id="createServiceOrder"]').click();

    // Wait for service order type options to load
    await page.locator('li[data-value="CALLOUT"]').waitFor({state: 'visible'});

    await page.locator('li[data-value="CALLOUT"]').click();

    await page.locator('button:has-text("Create")').click();

    // Wait for job creation form to load
    await expect(page.locator('text=New Callout Job')).toBeVisible();

    // Wait for Next button to be enabled
    await page.locator('button:has-text("Next")').waitFor({state: 'visible'});
    await page.locator('button:has-text("Next")').click();

    // Wait for Submit button to be enabled
    await page.locator('button:has-text("Submit")').waitFor({state: 'visible'});
    await page.locator('button:has-text("Submit")').click();

    const createJobResponse = await createJobAPIPromise;
    expect(createJobResponse.status()).toBe(200);
    await expect(
      page.locator('text=Order scheduled successfully'),
    ).toBeVisible();
  });

  test('should check payment terms are adding properly', async ({page}) => {
    const getRichTextField = () =>
      page.locator('div[data-testid="payment-terms-rich-text-field"]');

    const openPaymentTermsDialog = async () =>
      getRichTextField().locator('svg[data-testid="TextSnippetIcon"]').click();

    // Check payment terms without discount
    await openPaymentTermsDialog();

    const firstLabel = page
      .locator('div[role="presentation"] label:has(p:only-child)')
      .first();

    // Wait for payment terms dialog to load
    await firstLabel.waitFor({state: 'visible'});
    const paymentTermText = await firstLabel.textContent();

    await firstLabel.click();

    // Wait for confirm button to be ready
    const confirmButton = page.locator('button:has-text("Confirm")');
    await confirmButton.waitFor({state: 'visible'});
    await confirmButton.click();

    if (paymentTermText) {
      await expect(
        getRichTextField().locator('div[role="textbox"]'),
      ).toContainText(paymentTermText);
    }

    // Check payment terms with discount
    await openPaymentTermsDialog();

    const discountLabel = page
      .locator('div[role="presentation"] label:has(p:nth-of-type(3))')
      .first();

    // Wait for discount label to be visible
    await discountLabel.waitFor({state: 'visible'});

    const paymentTermName = await discountLabel
      .locator('p')
      .nth(0)
      .textContent();
    const discount1 = await discountLabel.locator('p').nth(1).textContent();
    const discount2 = await discountLabel.locator('p').nth(2).textContent();

    await discountLabel.click();

    // Wait for confirm button to be ready
    const discountConfirmButton = page.locator('button:has-text("Confirm")');
    await discountConfirmButton.waitFor({state: 'visible'});
    await discountConfirmButton.click();

    if (paymentTermName && discount1 && discount2) {
      const discounts = [discount1, discount2].map((d) => {
        const [days, discountPercentage] = d
          .split(';')
          .map((part) => part.trim().split(' ')[0]);
        return {days, discountPercentage};
      });

      const discountsText = discounts
        .map(
          ({days, discountPercentage}) =>
            `If payment is made within ${days} days, we grant a discount of ${discountPercentage} of the invoice amount.`,
        )
        .join('\n');

      const expectedText = `${paymentTermName}\n${discountsText}`;
      await expect(
        getRichTextField().locator('div[role="textbox"]'),
      ).toContainText(expectedText);
    }
  });

  test('should search for unit', async ({page, waitForSpinnerToDisappear}) => {
    const searchText = 'Schönhauser';
    const encodedSearchText = encodeURIComponent(searchText);

    await page.locator('button:has-text("Select Unit")').click();
    await waitForSpinnerToDisappear();

    // Wait for search input to be ready
    await page.locator('input[id="Search"]').waitFor({state: 'visible'});

    const searchElevatorsAPIPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/serviceCompanies/') &&
        resp.url().includes('/elevators') &&
        resp.request().method() === 'GET',
    );

    await page.locator('input[id="Search"]').fill(searchText);

    const searchResponse = await searchElevatorsAPIPromise;
    const url = new URL(searchResponse.url());
    const query = url.searchParams.get('query');

    expect(query).toBe(searchText);
    expect(searchResponse.url()).toContain(`query=${encodedSearchText}`);
  });
});
