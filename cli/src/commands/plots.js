import inquirer from 'inquirer';
import chalk from 'chalk';
import { plotsApi } from '../utils/api.js';

export async function listPlots() {
  const { landId } = await inquirer.prompt([
    { name: 'landId', message: 'Enter Land ID:', type: 'input' }
  ]);

  try {
    const { data } = await plotsApi.getByLand(landId);
    if (data.length === 0) {
      console.log(chalk.yellow('No plots found for this land.'));
      return;
    }
    console.log(chalk.bold(`\n=== Plots for Land ${landId} ===\n`));
    data.forEach((plot, idx) => {
      const statusColor = plot.status === 'available' ? chalk.green : chalk.red;
      console.log(`${idx + 1}. ${chalk.cyan(plot.plotNumber)}`);
      console.log(`   Area: ${plot.area} sq units`);
      console.log(`   Status: ${statusColor(plot.status)}`);
      console.log(`   Price: ${plot.price || 'N/A'}`);
      console.log(`   Dimensions: ${plot.dimensions?.width || '?'} x ${plot.dimensions?.length || '?'}`);
      console.log(`   ID: ${plot._id}\n`);
    });
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function getPlot() {
  const { id } = await inquirer.prompt([
    { name: 'id', message: 'Enter Plot ID:', type: 'input' }
  ]);
  try {
    const { data } = await plotsApi.getById(id);
    const statusColor = data.status === 'available' ? chalk.green : chalk.red;
    console.log(chalk.bold('\n=== Plot Details ===\n'));
    console.log(`Plot Number: ${chalk.cyan(data.plotNumber)}`);
    console.log(`Land ID: ${data.landId}`);
    console.log(`Area: ${data.area} sq units`);
    console.log(`Status: ${statusColor(data.status)}`);
    console.log(`Price: ${data.price || 'N/A'}`);
    console.log(`Dimensions: ${data.dimensions?.width || '?'} x ${data.dimensions?.length || '?'}`);
    console.log(`Coordinates: ${JSON.stringify(data.coordinates)}`);
    console.log(`Created: ${new Date(data.createdAt).toLocaleString()}`);
    console.log(`ID: ${data._id}\n`);
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function createPlot() {
  const answers = await inquirer.prompt([
    { name: 'landId', message: 'Land ID:', type: 'input' },
    { name: 'plotNumber', message: 'Plot Number:', type: 'input' },
    { name: 'area', message: 'Area (sq units):', type: 'number' },
    { name: 'price', message: 'Price:', type: 'input' },
    { name: 'width', message: 'Width:', type: 'number' },
    { name: 'length', message: 'Length:', type: 'number' }
  ]);

  const coordinates = await inquirer.prompt([
    { name: 'coords', message: 'Coordinates (JSON array of [x,y] pairs):', type: 'input' }
  ]);

  try {
    const data = {
      landId: answers.landId,
      plotNumber: answers.plotNumber,
      area: answers.area,
      price: answers.price ? Number(answers.price) : undefined,
      dimensions: { width: answers.width, length: answers.length },
      coordinates: JSON.parse(coordinates.coords || '[]')
    };
    const { data: result } = await plotsApi.create(data);
    console.log(chalk.green(`\nPlot created successfully! ID: ${result._id}\n`));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function updatePlot() {
  const { id } = await inquirer.prompt([
    { name: 'id', message: 'Enter Plot ID:', type: 'input' }
  ]);

  const { data: plot } = await plotsApi.getById(id).catch(() => ({ data: null }));
  if (!plot) {
    console.log(chalk.red('Plot not found.'));
    return;
  }

  const answers = await inquirer.prompt([
    { name: 'plotNumber', message: 'Plot Number:', type: 'input', default: plot.plotNumber },
    { name: 'area', message: 'Area (sq units):', type: 'number', default: plot.area },
    { name: 'price', message: 'Price:', type: 'input', default: plot.price || '' },
    { name: 'status', message: 'Status:', type: 'list', default: plot.status, choices: ['available', 'sold'] },
    { name: 'width', message: 'Width:', type: 'number', default: plot.dimensions?.width || 0 },
    { name: 'length', message: 'Length:', type: 'number', default: plot.dimensions?.length || 0 }
  ]);

  try {
    const data = {
      plotNumber: answers.plotNumber,
      area: answers.area,
      price: answers.price ? Number(answers.price) : undefined,
      status: answers.status,
      dimensions: { width: answers.width, length: answers.length }
    };
    const { data: result } = await plotsApi.update(id, data);
    console.log(chalk.green('\nPlot updated successfully!\n'));
    console.log(`Plot Number: ${result.plotNumber}`);
    console.log(`Status: ${result.status}`);
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function deletePlot() {
  const { id } = await inquirer.prompt([
    { name: 'id', message: 'Enter Plot ID to delete:', type: 'input' }
  ]);

  const { confirm } = await inquirer.prompt([
    { name: 'confirm', message: 'Are you sure?', type: 'confirm', default: false }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Cancelled.'));
    return;
  }

  try {
    await plotsApi.delete(id);
    console.log(chalk.green('Plot deleted successfully!'));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function importPlots() {
  const { landId } = await inquirer.prompt([
    { name: 'landId', message: 'Enter Land ID for these plots:', type: 'input' }
  ]);

  const { filePath } = await inquirer.prompt([
    { name: 'filePath', message: 'Enter JSON file path:', type: 'input' }
  ]);

  try {
    const { readFileSync } = await import('fs');
    const content = readFileSync(filePath, 'utf-8');
    const plots = JSON.parse(content);

    if (!Array.isArray(plots)) {
      throw new Error('JSON file must contain an array of plots');
    }

    let success = 0;
    let failed = 0;

    for (const plot of plots) {
      try {
        await plotsApi.create({ ...plot, landId });
        success++;
      } catch (err) {
        failed++;
        console.log(chalk.red(`Failed: ${plot.plotNumber || plot._id} - ${err.message}`));
      }
    }

    console.log(chalk.green(`\nImported ${success} plots. Failed: ${failed}\n`));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function exportPlots() {
  const { landId } = await inquirer.prompt([
    { name: 'landId', message: 'Enter Land ID:', type: 'input' }
  ]);

  const { filePath } = await inquirer.prompt([
    { name: 'filePath', message: 'Enter output JSON file path:', type: 'input' }
  ]);

  try {
    const { data } = await plotsApi.getByLand(landId);
    const { writeFileSync } = await import('fs');
    writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(chalk.green(`\nExported ${data.length} plots to ${filePath}\n`));
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

export async function plotsMenu() {
  const { action } = await inquirer.prompt([
    {
      name: 'action',
      message: 'Choose action:',
      type: 'list',
      choices: [
        'List plots by land',
        'Get plot by ID',
        'Create new plot',
        'Update plot',
        'Delete plot',
        'Import plots from JSON',
        'Export plots to JSON',
        'Back to main menu'
      ]
    }
  ]);

  switch (action) {
    case 'List plots by land':
      await listPlots();
      break;
    case 'Get plot by ID':
      await getPlot();
      break;
    case 'Create new plot':
      await createPlot();
      break;
    case 'Update plot':
      await updatePlot();
      break;
    case 'Delete plot':
      await deletePlot();
      break;
    case 'Import plots from JSON':
      await importPlots();
      break;
    case 'Export plots to JSON':
      await exportPlots();
      break;
    case 'Back to main menu':
      return;
  }

  await plotsMenu();
}
