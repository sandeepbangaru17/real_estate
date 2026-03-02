import inquirer from 'inquirer';
import chalk from 'chalk';
import { landsApi } from '../utils/api.js';

export async function listLands() {
  try {
    const { data } = await landsApi.getAll();
    if (data.length === 0) {
      console.log(chalk.yellow('No lands found.'));
      return;
    }
    console.log(chalk.bold('\n=== Lands ===\n'));
    data.forEach((land, idx) => {
      console.log(`${idx + 1}. ${chalk.cyan(land.name)}`);
      console.log(`   Location: ${land.location}`);
      console.log(`   Area: ${land.totalArea} sq units`);
      console.log(`   ID: ${land._id}\n`);
    });
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function getLand() {
  const { id } = await inquirer.prompt([
    { name: 'id', message: 'Enter Land ID:', type: 'input' }
  ]);
  try {
    const { data } = await landsApi.getById(id);
    console.log(chalk.bold('\n=== Land Details ===\n'));
    console.log(`Name: ${chalk.cyan(data.name)}`);
    console.log(`Location: ${data.location}`);
    console.log(`Total Area: ${data.totalArea} sq units`);
    console.log(`Description: ${data.description || 'N/A'}`);
    console.log(`Image URL: ${data.imageUrl || 'N/A'}`);
    console.log(`Coordinates: ${JSON.stringify(data.coordinates)}`);
    console.log(`Created: ${new Date(data.createdAt).toLocaleString()}`);
    console.log(`ID: ${data._id}\n`);
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function createLand() {
  const answers = await inquirer.prompt([
    { name: 'name', message: 'Land Name:', type: 'input' },
    { name: 'location', message: 'Location:', type: 'input' },
    { name: 'totalArea', message: 'Total Area (sq units):', type: 'number' },
    { name: 'description', message: 'Description:', type: 'input' },
    { name: 'imageUrl', message: 'Image URL:', type: 'input' }
  ]);

  const coordinates = await inquirer.prompt([
    { name: 'coords', message: 'Coordinates (JSON array of [x,y] pairs):', type: 'input' }
  ]);

  try {
    const data = {
      ...answers,
      coordinates: JSON.parse(coordinates.coords || '[]')
    };
    const { data: result } = await landsApi.create(data);
    console.log(chalk.green(`\nLand created successfully! ID: ${result._id}\n`));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function updateLand() {
  const { id } = await inquirer.prompt([
    { name: 'id', message: 'Enter Land ID:', type: 'input' }
  ]);

  const { data: land } = await landsApi.getById(id).catch(() => ({ data: null }));
  if (!land) {
    console.log(chalk.red('Land not found.'));
    return;
  }

  const answers = await inquirer.prompt([
    { name: 'name', message: 'Land Name:', type: 'input', default: land.name },
    { name: 'location', message: 'Location:', type: 'input', default: land.location },
    { name: 'totalArea', message: 'Total Area (sq units):', type: 'number', default: land.totalArea },
    { name: 'description', message: 'Description:', type: 'input', default: land.description || '' },
    { name: 'imageUrl', message: 'Image URL:', type: 'input', default: land.imageUrl || '' }
  ]);

  try {
    const { data: result } = await landsApi.update(id, answers);
    console.log(chalk.green('\nLand updated successfully!\n'));
    console.log(`Name: ${result.name}`);
    console.log(`Location: ${result.location}`);
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function deleteLand() {
  const { id } = await inquirer.prompt([
    { name: 'id', message: 'Enter Land ID to delete:', type: 'input' }
  ]);

  const { confirm } = await inquirer.prompt([
    { name: 'confirm', message: 'Are you sure?', type: 'confirm', default: false }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }

  try {
    await landsApi.delete(id);
    console.log(chalk.green('Land deleted successfully!'));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function importLands() {
  const { filePath } = await inquirer.prompt([
    { name: 'filePath', message: 'Enter JSON file path:', type: 'input' }
  ]);

  try {
    const { readFileSync } = await import('fs');
    const content = readFileSync(filePath, 'utf-8');
    const lands = JSON.parse(content);

    if (!Array.isArray(lands)) {
      throw new Error('JSON file must contain an array of lands');
    }

    let success = 0;
    let failed = 0;

    for (const land of lands) {
      try {
        await landsApi.create(land);
        success++;
      } catch (err) {
        failed++;
        console.log(chalk.red(`Failed: ${land.name || land._id} - ${err.message}`));
      }
    }

    console.log(chalk.green(`\nImported ${success} lands. Failed: ${failed}\n`));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function exportLands() {
  const { filePath } = await inquirer.prompt([
    { name: 'filePath', message: 'Enter output JSON file path:', type: 'input' }
  ]);

  try {
    const { data } = await landsApi.getAll();
    const { writeFileSync } = await import('fs');
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(chalk.green(`\nExported ${data.length} lands to ${filePath}\n`));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function landsMenu() {
  const { action } = await inquirer.prompt([
    {
      name: 'action',
      message: 'Choose action:',
      type: 'list',
      choices: [
        'List all lands',
        'Get land by ID',
        'Create new land',
        'Update land',
        'Delete land',
        'Import lands from JSON',
        'Export lands to JSON',
        'Back to main menu'
      ]
    }
  ]);

  switch (action) {
    case 'List all lands':
      await listLands();
      break;
    case 'Get land by ID':
      await getLand();
      break;
    case 'Create new land':
      await createLand();
      break;
    case 'Update land':
      await updateLand();
      break;
    case 'Delete land':
      await deleteLand();
      break;
    case 'Import lands from JSON':
      await importLands();
      break;
    case 'Export lands to JSON':
      await exportLands();
      break;
    case 'Back to main menu':
      return;
  }

  await landsMenu();
}
