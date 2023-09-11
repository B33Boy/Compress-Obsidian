import { 
	App,  
	Editor, 
	MarkdownView, 
	Modal, 
	Plugin, 
	Notice,
	PluginSettingTab, 
	Setting} from 'obsidian';

// Remember to rename these classes and interfaces!

interface HandlePaste {
	(this: HTMLElement, ev: ClipboardEvent, editor: Editor): void;
}

interface CompressSettings {
	compressRatio: string;
}

const DEFAULT_SETTINGS: CompressSettings = {
	compressRatio: "0.5"
}

export default class Compress extends Plugin {
	settings: CompressSettings;

	handlePaste: HandlePaste;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("image-minus", "Compress",() => {
		});

		this.handlePaste = this.updatePastedImage.bind(this);
		
		this.registerEvent(
			this.app.workspace.on("editor-paste", this.handlePaste)
		);


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CompressSettingsTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Utility functions go below ======================================================================
	async updatePastedImage(ev: ClipboardEvent, editor: Editor): Promise<void>
	{
		if (ev.defaultPrevented) {
			return;
		}
		ev.preventDefault();

		  // Get text from editor to get source url of image
		  
		  // Represent image using TFile 

		  // Use some API to compress the image

		  // Paste the image

		  new Notice("Pasted an Image"); // Check if the pasted 
	}

}

class CompressSettingsTab extends PluginSettingTab {
	plugin: Compress;

	constructor(app: App, plugin: Compress) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Compression Ratio')
			.setDesc('Compression Ratio')
			.addText(text => text
				.setPlaceholder('Compression Ratio')
				.setValue(this.plugin.settings.compressRatio)
				.onChange(async (value: string) => {
					this.plugin.settings.compressRatio = value;
					await this.plugin.saveSettings();
				})); 
	}
}
 