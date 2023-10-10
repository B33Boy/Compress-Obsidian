import { 
	App,  
	Editor, 
	MarkdownView,
	MarkdownFileInfo, 
	Notice,
	Plugin, 
	PluginSettingTab, 
	Setting,
	TFile,
	TFolder} from 'obsidian';

import compressImage from './imgprocess';


interface CompressSettings {
	compressRatio: string;
}

const DEFAULT_SETTINGS: CompressSettings = {
	compressRatio: "0.5"
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

		let types = ev.clipboardData.types;
		
		if (types && types.includes("Files")){

			const imgFiles = Array.from(ev.clipboardData.files);
			const img = imgFiles.find(file => file.type.startsWith("image/"));
			
			if (img){
				ev.preventDefault();
				
				let fileData = "";
				console.log("Image Found! Type: " + img.type);
				
				const reader = new FileReader();
				reader.onloadend = () => {
					let fileData = reader.result as string;

					console.log("READ DATA: ", fileData)

					const randomVal = Math.floor(Math.random() * 1000);
					let imgFileName: string = `temp-image-name-${randomVal}.png`;

					this.saveImage(imgFileName, fileData);

					// call compressImage
					const imgLink = `![[${imgFileName}]]`;
					editor.replaceSelection(imgLink);
				};
				
				reader.readAsText(img);
				
				// const randomVal = Math.floor(Math.random() * 100);
				// let imgFileName: string = `temp-image-name-${randomVal}.png`;

				// console.log(`${imgFileName} and ${fileData}`);
				// this.saveImage(imgFileName, fileData);

				// // call compressImage
				// const imgLink = `![[${imgFileName}]]`;
				// editor.replaceSelection(imgLink);
			}			
		}
		console.log("Fn finished");
	}

	async saveImage(fileName: string, imageData: string): Promise<void> {
		//get current folder path
		const activeFile: TFile | null = this.app.workspace.getActiveFile();

		if (!activeFile || !activeFile.parent) {
			// throw error
			new Notice("No active file");
			return;
		}

		const currentFolderPath: string | null = activeFile.parent.path;
		const arrayBuffer = new TextEncoder().encode(imageData).buffer;
		await this.app.vault.createBinary(`${currentFolderPath}/${fileName}`, arrayBuffer);
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
 