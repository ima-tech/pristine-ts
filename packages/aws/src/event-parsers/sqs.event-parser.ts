import {Event, EventParserInterface} from "@pristine-ts/event";
import {ServiceDefinitionTagEnum, tag} from "@pristine-ts/common";
import {injectable} from "tsyringe";
import {SqsEventPayload} from "../event-payloads/sqs.event-payload";
import {SqsAttributesModel} from "../models/sqs-attributes.model";
import {SqsEventType} from "../enums/sqs-event-type.enum";

@tag(ServiceDefinitionTagEnum.EventParser)
@injectable()
export class SqsEventParser implements EventParserInterface<SqsEventPayload>{

    parse(rawEvent: any): Event<SqsEventPayload>[] {
        const parsedEvents: Event<SqsEventPayload>[] = [];
        for(const record of rawEvent.Records) {
            const event = new Event<SqsEventPayload>();
            event.type = SqsEventType.SqsEvent;
            event.payload = new SqsEventPayload();

            event.payload.eventSource = record.eventSource;
            event.payload.awsRegion = record.awsRegion;
            event.payload.body = record.body;
            event.payload.eventSourceArn = record.eventSourceARN;
            event.payload.md5OfBody = record.md5OfBody;
            event.payload.messageAttributes = record.messageAttributes;
            event.payload.receiptHandle = record.receiptHandle;
            event.payload.messageId = record.messageId;

            if (record.attributes) {
                event.payload.attributes = new SqsAttributesModel();
                if (isNaN(+record.attributes.ApproximateFirstReceiveTimestamp) === false) {
                    event.payload.attributes.approximateFirstReceiveTime = new Date(+record.attributes.ApproximateFirstReceiveTimestamp);
                }
                if (isNaN(+record.attributes.SentTimestamp) === false) {
                    event.payload.attributes.sentTime = new Date(+record.attributes.SentTimestamp);
                }
                event.payload.attributes.senderId = record.attributes.SenderId;
                event.payload.attributes.approximateReceiveCount = isNaN(+record.attributes.ApproximateReceiveCount) ? undefined : +record.attributes.ApproximateReceiveCount;

                event.payload.attributes.messageGroupId = record.attributes.MessageGroupId;
                event.payload.attributes.messageDeduplicationId = record.attributes.MessageDeduplicationId;
                event.payload.attributes.sequenceNumber = record.attributes.SequenceNumber;
            }

            parsedEvents.push(event);
        }
        return parsedEvents;
    }

    supports(event: any): boolean {
        return event.hasOwnProperty("Records") &&
            Array.isArray(event.Records) &&
            event.Records[0].hasOwnProperty("eventSource") &&
            event.Records[0].eventSource === "aws:sqs"
    }

}
