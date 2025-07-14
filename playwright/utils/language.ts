export const LANGUAGE_MAP = {
  EN: {
    English: 'English',
    Deutsche: 'Deutsche',
    Serbian: 'Serbian',
    Italian: 'Italian',
    Russian: 'Russian',
  },
  DE: {
    English: 'Englisch',
    Deutsche: 'Deutsche',
    Serbian: 'Serbian',
    Italian: 'Italian',
    Russian: 'Russisch',
  },
  SR: {
    English: 'Engleski jezik',
    Deutsche: 'Deutsche',
    Serbian: 'Serbian',
    Italian: 'Italian',
    Russian: 'Russian',
  },
  IT: {
    English: 'Inglese',
    Deutsche: 'Deutsche',
    Serbian: 'Serbian',
    Italian: 'Italian',
    Russian: 'Ruski',
  },
  RU: {
    English: 'Английский',
    Deutsche: 'Немецкий',
    Serbian: 'Сербия',
    Italian: 'Италия',
    Russian: 'Русский',
  },
};

export async function selectLanguage(page, languageText = 'English') {
  await page.waitForSelector('[data-testid="spinner"]', { state: 'detached', timeout: 10000 });
  const menuVisible = await page.isVisible('#topBarSelectLanguageMenuList');
  if (!menuVisible) {
    await page.waitForSelector('#topBarSelectLanguageButton', { timeout: 10000 });
    await page.click('#topBarSelectLanguageButton');
  }
  await page.waitForSelector('#topBarSelectLanguageMenuList', { timeout: 10000 });

  // Try all possible translations for the languageText in all languages
  const allTranslations = Object.values(LANGUAGE_MAP)
    .map(map => map[languageText])
    .filter(Boolean);

  const options = await Promise.all(
    allTranslations.map(async (translatedText) => {
      const option = page.locator('#topBarSelectLanguageMenuList li', { hasText: translatedText });
      return (await option.count()) > 0 ? option : null;
    })
  );
  
  const found = options.find(Boolean);
  if (found) {
    await found.first().click();
    return;
  }
  throw new Error(`Could not find language option for "${languageText}"`);
} 