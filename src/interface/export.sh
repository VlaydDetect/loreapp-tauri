for f in *.ts ; do echo "export * from './${f%%.ts}';" ; done > index.ts
sed -i '/index/d' index.ts