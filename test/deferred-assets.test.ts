import test from "ava";
import {withTypeScript} from "./util/ts-macro.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {formatCode} from "./util/format-code.js";

test.serial("Won't break when other plugins declare deferred assets. #1", withTypeScript, async (t, {typescript}) => {
	let asset: string | undefined;

	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				console.log('whatever');`
			}
		],
		{
			typescript,
			postPlugins: [
				{
					name: "my-plugin",
					buildStart() {
						asset = this.emitFile({
							type: "asset",
							fileName: "test.txt"
						});
					},
					generateBundle() {
						this.setAssetSource(asset!, "whatever");
					}
				}
			]
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			export {};
		`)
	);
});
