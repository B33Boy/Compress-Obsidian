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

import axios from 'axios';
import Compressor  from 'compressorjs';

import {compressImage, compressFile} from './imgprocess';




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
				
				// Get file name
				const fileType = img.type.substring(6);
				const imgFileName: string = `comp-${Date.now()}.${fileType}`;
				// console.log("Image Found! Type: " + img.type);

				// Grab Uint8Array from image file
				const imgBuffer = await img.arrayBuffer();
				const imgData = new Uint8Array(imgBuffer);
				console.log("old bytelength", imgData.byteLength);

				// Get dims
				const dims = await this.getImageDims(img);

				// console.log(typeof img);
				// compressFile(img);
				
				const imgArray : Uint8Array = await compressFile(img);
				console.log("new bytelength", imgArray.byteLength);



				// console.log("Size before compressing:", imgData.length);				
				const compressedImg: Uint8Array = compressImage(imgData);
				// console.log("Size after compressing:", compressedImg.length);
				
				// Save image and insert link
				this.saveImage(imgFileName, imgArray);
				this.saveImage("old_" + imgFileName, imgData);
				const imgLink = `![[${imgFileName}]]`;
				editor.replaceSelection(imgLink);
			}			
		}
		console.log("Fn finished");
	}

	async getImageDims(img: File):  Promise<{width: number; height: number}>{

		const img4dim = new Image();
		const url = URL.createObjectURL(img);

		// Set the Image source to the clipboard image
		img4dim.src = url;

		// Wait for the image to load
		await new Promise((resolve) => {
			img4dim.onload = resolve;
		});

        // Get the dimensions
        const width = img4dim.width;
        const height = img4dim.height;

        // Return the dimensions
        return { width, height };
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
 