import { Message } from '../../../types/Message';
import { Util } from '../../../util/Util';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { GuildStorage } from '../../../types/GuildStorage';
import * as CommandDecorators from '../../CommandDecorators';
const { using } = CommandDecorators;

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'clearlimit',
			description: 'Clear role restrictions from a command',
			usage: '<prefix>clearlimit <command>',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.expect({ '<command>': 'String' }))
	public async action(message: Message, [commandName]: [string]): Promise<Message | Message[]>
	{
		let command: Command = this.client.commands.find(c => Util.normalize(c.name) === Util.normalize(commandName));
		if (!command) return this.respond(message, `Failed to find a command with the name \`${commandName}\``);

		const storage: GuildStorage = message.guild.storage;
		let limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands') || {};
		delete limitedCommands[command.name];
		storage.settings.set('limitedCommands', limitedCommands);

		return this.respond(message, `Successfully cleared role limits for command: \`${command.name}\``);
	}
}