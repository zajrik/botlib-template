import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import now = require('performance-now');

export default class extends Command<Client>
{
	public constructor(client: Client)
	{
		super(client, {
			name: 'reload',
			description: 'Reload a command or all commands',
			usage: '<prefix>reload [command]',
			extraHelp: `If a command name or alias is provided the specific command will be reloaded. Otherwise, all commands will be reloaded.`,
			ownerOnly: true
		});
	}

	public action(message: Message, [commandName]: [string]): Promise<Message | Message[]>
	{
		const start: number = now();
		const command: Command<Client> = this.client.commands.findByNameOrAlias(commandName);

		if (commandName && !command)
			return this.respond(message, `Command "${commandName}" could not be found.`);

		if (command) this.client.loadCommand(command.name);
		else this.client.loadCommand('all');

		const end: number = now();
		const name: string = command ? command.name : null;
		const text: string = name ? ` "${name}"` : 's';
		return this.respond(message, `Command${text} reloaded. (${(end - start).toFixed(3)} ms)`);
	}
}