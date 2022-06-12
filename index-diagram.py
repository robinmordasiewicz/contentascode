from diagrams import Cluster, Diagram, Edge
from diagrams.k8s.compute import RS
from diagrams.custom import Custom
from diagrams.onprem.network import Istio
from diagrams.generic.device import Mobile

global_attr = {
    "fontsize": "24",
    "bgcolor": "#FFFFFF",
    "fontcolor": "#326ce5",
    "fontname": "Arial"
}
k8s_attr = {
    "fontsize": "24",
    "bgcolor": "#E0E0E0",
    "fontcolor": "#326ce5",
    "fontname": "Arial"
}
spk_attr = {
    "fontsize": "22",
    "bgcolor": "#0E487A",
    "fontcolor": "#FFFFFF",
    "fontname": "Arial"
}
node_attr = {
    "fontsize": "16",
    "fontcolor": "#000000",
    "fontname": "Arial"
}

with Diagram(name="F5 - Cloud Native Solutions", show=False, direction="LR", filename="diagram1", outformat="png", graph_attr=global_attr,node_attr=node_attr):

    subscribers = Mobile("Subscribers")
    with Cluster("BIG-IP NEXT",graph_attr=spk_attr):
        spk = Custom("Service Proxy", "images/f5-logo-white.png")
        subscribers - Edge(color="darkorange",style="dashed",label="SIP HTTP2 Diamter") - spk
    with Cluster("Kubernetes",graph_attr=k8s_attr):
        diameter = RS("Diameter")
        spk - diameter
        sip = RS("SIP")
        spk - sip
        http2 = RS("HTTP/2")
        spk - http2
        servicemesh = Custom("Service Mesh", "images/ASPEN.png")
        diameter - servicemesh
        sip - servicemesh
        http2 - servicemesh
