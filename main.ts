import { 
	App,  
	Editor, 
	MarkdownView,
	Notice,
	Plugin, 
	PluginSettingTab, 
	Setting,
	TFile} from 'obsidian';

import {compressFile} from './imgprocess';

interface CompressSettings {
	compressRatio: number;
}

const DEFAULT_SETTINGS: CompressSettings = {
	compressRatio: 0.5
}

export default class Compress extends Plugin {
	settings: CompressSettings;

	// handlePaste: HandlePaste;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("image-minus", "Compress",() => {
			console.log("Does nothing lol");
		});

		// this.handlePaste = this.updatePastedImage.bind(this);
		
		this.registerEvent(
			this.app.workspace.on("editor-paste", this.updatePastedImage.bind(this))
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
	async updatePastedImage(ev: ClipboardEvent, editor: Editor, view: MarkdownView): Promise<void>
	{
		if (ev.defaultPrevented || !ev.clipboardData) return;

		const types = ev.clipboardData.types;
		
		if (types && types.includes("Files")){

			const files: Array<File> = Array.from(ev.clipboardData.files);
			const imgFile: File | undefined = files.find(file => file.type.startsWith("image/"));
			
			if (imgFile){
				ev.preventDefault();
				
				// Get output file name and name
				const fileType: string = imgFile.type.substring(6);
				const imgFileName = `comp-${Date.now()}.${fileType}`;

				// Call compression function
				const imgArray: Uint8Array = await compressFile(imgFile, this.settings.compressRatio as number);
				
				// Save image and insert link
				this.saveImage(imgFileName, imgArray);
				const imgLink = `![[${imgFileName}]]`;
				editor.replaceSelection(imgLink);
			}			
		}
		console.log("Fn finished");
	}

	async saveImage(fileName: string, imageData: Uint8Array): Promise<void> {
		const activeFile: TFile | null = this.app.workspace.getActiveFile();

		if (!activeFile || !activeFile.parent) {
			new Notice("No active file");
			return;
		}

		const currentFolderPath: string | null = activeFile.parent.path;
		await this.app.vault.createBinary(`${currentFolderPath}/${fileName}`, imageData);
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
		.setDesc('Compression Ratio (0 to 1)')
		.addSlider((slider) => slider
			.setValue(this.plugin.settings.compressRatio)
			.setLimits(0, 1, 0.1)
			.onChange(async (value) => {
				this.plugin.settings.compressRatio = value;
				await this.plugin.saveSettings();
			})
			.setDynamicTooltip()
		);
	}
}
 