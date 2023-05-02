import * as pulumi from "@pulumi/pulumi";
import * as vsphere from "@pulumi/vsphere";

const datacenter = vsphere.getDatacenter({
  name: "Datacenter",
});

const dc = vsphere.getDatacenter({ name: "Datacenter" });
const datastoreId = dc.then(dc => vsphere.getDatastore({ name: "SAS-7.2k-R5", datacenterId: dc.id })).then(d => d.id);
const poolId = dc.then(dc => vsphere.getResourcePool({ name: "Iac-Resource-Pool", datacenterId: dc.id })).then(p => p.id);
const networkId = dc.then(dc => vsphere.getNetwork({ name: "VLAN 32", datacenterId: dc.id })).then(n => n.id);
const template = dc.then(dc => vsphere.getVirtualMachine({ name: "Templates/IaC-Ubuntu-Template", datacenterId: dc.id }));


function createVirtualMachine(name, poolId, datastoreId, networkId, template) {
  return new vsphere.VirtualMachine(name, {
    resourcePoolId: poolId,
    name: name,
    datastoreId: datastoreId,
    folder: "Iac-VMS",
    numCpus: 2,
    memory: 2048,
    guestId: template.then(t => t.guestId),
    networkInterfaces: [{
      networkId: networkId,
      adapterType: template.then(t => t.networkInterfaceTypes[0]),
    }],
    disks: [{
      label: "disk0",
      size: template.then(t => t.disks[0].size),
      eagerlyScrub: template.then(t => t.disks[0].eagerlyScrub),
      thinProvisioned: template.then(t => t.disks[0].thinProvisioned),
    }],
    clone: {
      templateUuid: template.then(t => t.id),
    },
  });
}

const vm = createVirtualMachine("VM-UB-Node1", poolId, datastoreId, networkId, template);


