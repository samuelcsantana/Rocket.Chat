import { AddEventResult, ContextQuery, EventsModel, EventStub } from './Events';
import { getLocalSrc } from '../../../events/server/lib/getLocalSrc';
import { IEDataGenesis } from '../../../events/definitions/data/IEDataGenesis';
import { IEDataMessage } from '../../../events/definitions/data/IEDataMessage';
import { IEvent, EventTypeDescriptor, EDataDefinition } from '../../../events/definitions/IEvent';
import { IRoom } from '../../../events/definitions/IRoom';
import { IEDataUpdate } from '../../../events/definitions/data/IEDataUpdate';

const getContextQuery = (param: string | IEvent<any>): ContextQuery => {
  let rid: string;

  if (typeof param === 'string') {
    rid = param;
  } else {
    rid = param.rid;
  }

  return { rid };
};

class RoomEventsModel extends EventsModel {
  constructor() {
    super('message');

    // this.tryEnsureIndex({ 'context.roomId': 1 });
    // this.tryEnsureIndex({ 'd.msg': 'text' }, { sparse: true });
  }

  ensureSrc(src: string) {
    return src || getLocalSrc();
  }

  async addRoomEvent<T extends EDataDefinition>(event: IEvent<T>): Promise<AddEventResult> {
    return super.addEvent(getContextQuery(event), event);
  }

  async updateRoomEventData<T extends EDataDefinition>(event: IEvent<T>, dataToUpdate: IEDataUpdate<T>): Promise<void> {
    return super.updateEventData(getContextQuery(event), event._cid, dataToUpdate);
  }

  async createRoomGenesisEvent(src: string, room: IRoom): Promise<IEvent<IEDataGenesis>> {
    src = this.ensureSrc(src);

    const event: IEDataGenesis = { room };

    return super.createGenesisEvent(src, getContextQuery(room._id), event);
  }

  async createMessageEvent<T extends IEDataMessage>(src: string, roomId: string, _cid: string, d: T): Promise<IEvent<T>> {
    src = this.ensureSrc(src);

    const stub: EventStub<T> = {
      _cid,
      t: EventTypeDescriptor.MESSAGE,
      d
    };

    return super.createEvent(src, getContextQuery(roomId), stub);
  }

  async createEditMessageEvent<T extends IEDataMessage>(src: string, roomId: string, _cid: string, d: IEDataUpdate<T>): Promise<IEvent<T>> {
    src = this.ensureSrc(src);

    const stub: EventStub<T> = {
      _cid,
      t: EventTypeDescriptor.EDIT_MESSAGE,
      d
    };

    return super.createEvent(src, getContextQuery(roomId), stub);
  }

  // async createDeleteRoomEvent(src, roomId) {
  // 	return super.createEvent(src, getContextQuery(roomId), eventTypes.ROOM_DELETE, { roomId });
  // }

  // async createAddUserEvent(src, roomId, user, subscription, domainsAfterAdd) {
  // 	return super.createEvent(src, getContextQuery(roomId), eventTypes.ROOM_ADD_USER, { roomId, user, subscription, domainsAfterAdd });
  // }

  // async createRemoveUserEvent(src, roomId, user, domainsAfterRemoval) {
  // 	return super.createEvent(src, getContextQuery(roomId), eventTypes.ROOM_REMOVE_USER, { roomId, user, domainsAfterRemoval });
  // }

  // async createDeleteMessageEvent(src, roomId, messageId) {
  // 	return super.createEvent(src, getContextQuery(roomId), eventTypes.ROOM_DELETE_MESSAGE, { roomId, messageId });
  // }

  // async createSetMessageReactionEvent(src, roomId, messageId, username, reaction) {
  // 	return super.createEvent(src, getContextQuery(roomId), eventTypes.ROOM_SET_MESSAGE_REACTION, { roomId, messageId, username, reaction });
  // }

  // async createUnsetMessageReactionEvent(src, roomId, messageId, username, reaction) {
  // 	return super.createEvent(src, getContextQuery(roomId), eventTypes.ROOM_UNSET_MESSAGE_REACTION, { roomId, messageId, username, reaction });
  // }

  // async createMuteUserEvent(src, roomId, user) {
  // 	return super.createEvent(src, getContextQuery(roomId), eventTypes.ROOM_MUTE_USER, { roomId, user });
  // }

  // async createUnmuteUserEvent(src, roomId, user) {
  // 	return super.createEvent(src, getContextQuery(roomId), eventTypes.ROOM_UNMUTE_USER, { roomId, user });
  // }

  // async removeRoomEvents(roomId) {
  // 	return super.removeContextEvents(getContextQuery(roomId));
  // }

  //
  // Backwards compatibility
  //
  fromV1Data(message: any): IEDataMessage {
    return {
      u: message.u,
      msg: message.msg,
      mentions: message.mentions,
      channels: message.channels,
      reactions: message.reactions,
    };
  }

  toV1(event: any) {
    console.log(event);

    const v1Data: any = {
      _id: event._cid,
      v: 1,
      rid: event.rid,
      u: event.d.u,
      ts: event.ts,
      msg: event.d.msg,
      html: event.d.html,
      unread: event.d.unread,
      mentions: event.d.mentions,
      channels: event.d.channels,
      _updatedAt: event._updatedAt,
    };

    if (event.d.reactions) {
      v1Data.reactions = event.d.reactions;
    }

    return v1Data;
  }
}

export const RoomEvents = new RoomEventsModel();