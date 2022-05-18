import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { CfnDisk } from 'aws-cdk-lib/aws-lightsail';
import { CdkCommand } from 'aws-cdk-lib/cloud-assembly-schema';
import { Construct } from 'constructs';

interface NetworkingProps {
    maxAzs:number
}

export class Networking extends Construct {

    public readonly vpc:ec2.IVpc;

    constructor(scope: Construct, id: string, props?: NetworkingProps) {
        super(scope, id);

        const vpc = new ec2.Vpc(this, 'AppVPC', {
            // 'cidr' configures the IP range and size of the entire VPC.
            // The IP space will be divided over the configured subnets.
            cidr: '10.0.0.0/21',
          
            // 'maxAzs' configures the maximum number of availability zones to use
            maxAzs: props?.maxAzs,    
            // 'subnetConfiguration' specifies the "subnet groups" to create.
            // Every subnet group will have a subnet for each AZ, so this
            // configuration will create `3 groups × 3 AZs = 9` subnets.
            subnetConfiguration: [
              {
                // 'subnetType' controls Internet access, as described above.
                subnetType: ec2.SubnetType.PUBLIC,
          
                // 'name' is used to name this particular subnet group. You will have to
                // use the name for subnet selection if you have more than one subnet
                // group of the same type.
                name: 'Ingress',
          
                // 'cidrMask' specifies the IP addresses in the range of of individual
                // subnets in the group. Each of the subnets in this group will contain
                // `2^(32 address bits - 24 subnet bits) - 2 reserved addresses = 254`
                // usable IP addresses.
                //
                // If 'cidrMask' is left out the available address space is evenly
                // divided across the remaining subnet groups.
                cidrMask: 24,
              },
              {
                cidrMask: 24,
                name: 'Application',
                subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
              },
              {
                cidrMask: 28,
                name: 'Database',
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          
                // 'reserved' can be used to reserve IP address space. No resources will
                // be created for this subnet, but the IP range will be kept available for
                // future creation of this subnet, or even for future subdivision.
                reserved: true
              }
            ],
          });

    }
}